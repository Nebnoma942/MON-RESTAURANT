import { db, ordersTable, usersTable, loyaltyHistoryTable } from "@workspace/db";
import { and, eq, ne, sql } from "drizzle-orm";

export const POINTS_FOR_DISCOUNT = 15;

export function requiresPrepayment(paymentMethod: string): boolean {
  return paymentMethod === "orange_money" || paymentMethod === "moov_money";
}

/**
 * Marks an order delivered and awards its earned loyalty points exactly once.
 * The order status change and loyalty ledger update are committed atomically.
 */
export async function finalizeOrderDelivery(orderId: number) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) return null;
    if (order.status === "delivered") return order;

    const [updated] = await tx.update(ordersTable)
      .set({
        status: "delivered",
        ...(order.paymentMethod === "cash" && { paymentStatus: "paid" as const }),
      })
      .where(and(eq(ordersTable.id, orderId), ne(ordersTable.status, "delivered")))
      .returning();

    if (!updated) return order;

    if (updated.customerId && updated.loyaltyPointsEarned > 0) {
      const [customer] = await tx.select({ loyaltyPoints: usersTable.loyaltyPoints })
        .from(usersTable)
        .where(eq(usersTable.id, updated.customerId));

      if (customer) {
        await tx.update(usersTable)
          .set({ loyaltyPoints: sql`${usersTable.loyaltyPoints} + ${updated.loyaltyPointsEarned}` })
          .where(eq(usersTable.id, updated.customerId));

        await tx.insert(loyaltyHistoryTable).values({
          userId: updated.customerId,
          orderId: updated.id,
          points: updated.loyaltyPointsEarned,
          description: `Points gagnés pour la commande #${updated.id}`,
        });
      }
    }

    return updated;
  });
}

/**
 * Refunds loyalty points reserved as a checkout discount when an order is cancelled.
 * The ledger entry is linked to the order so the refund is idempotent.
 */
export async function refundOrderLoyaltyDiscount(orderId: number) {
  return db.transaction(async (tx) => {
    const [order] = await tx.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order || !order.customerId || order.discount <= 0) return false;

    const existingRefund = await tx.select({ id: loyaltyHistoryTable.id })
      .from(loyaltyHistoryTable)
      .where(and(
        eq(loyaltyHistoryTable.orderId, orderId),
        eq(loyaltyHistoryTable.points, POINTS_FOR_DISCOUNT),
      ));

    if (existingRefund.length > 0) return false;


    const [customer] = await tx.select({ loyaltyPoints: usersTable.loyaltyPoints })
      .from(usersTable)
      .where(eq(usersTable.id, order.customerId));

    if (!customer) return false;

    await tx.update(usersTable)
      .set({ loyaltyPoints: sql`${usersTable.loyaltyPoints} + ${POINTS_FOR_DISCOUNT}` })
      .where(eq(usersTable.id, order.customerId));

    await tx.insert(loyaltyHistoryTable).values({
      userId: order.customerId,
      orderId,
      points: POINTS_FOR_DISCOUNT,
      description: `Remboursement des ${POINTS_FOR_DISCOUNT} points utilisés pour la commande #${orderId} annulée`,
    });

    return true;
  });
}
