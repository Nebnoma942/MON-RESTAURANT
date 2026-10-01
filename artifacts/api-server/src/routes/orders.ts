import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, dishesTable, restaurantsTable, usersTable, loyaltyHistoryTable, deliveryAssignmentsTable } from "@workspace/db";
import { and, desc, eq, gte } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../lib/auth";
import { optionalAuth } from "../lib/optional-auth";
import { calculateDeliveryFee } from "../lib/delivery-fee";
import { assignNearestAvailableDriver } from "../lib/dispatch";
import type { OrderItem } from "@workspace/db";
import { finalizeOrderDelivery, refundOrderLoyaltyDiscount, POINTS_FOR_DISCOUNT, requiresPrepayment } from "../lib/order-lifecycle";

const router: IRouter = Router();
const POINTS_PER_1000_FCFA = 1;
const DISCOUNT_AMOUNT = 1000;
const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    id: o.id,
    trackingToken: o.trackingToken,
    customerId: o.customerId,
    guestName: o.guestName,
    guestPhone: o.guestPhone,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurantName,
    items: o.items as OrderItem[],
    status: o.status,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    deliveryAddress: o.deliveryAddress,
    deliveryCity: o.deliveryCity,
    deliveryLat: o.deliveryLat,
    deliveryLng: o.deliveryLng,
    deliveryZoneId: o.deliveryZoneId,
    deliveryDistanceKm: o.deliveryDistanceKm,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    loyaltyPointsEarned: o.loyaltyPointsEarned,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

// GET /orders — clients see their own orders, restaurants see their orders, admins see all.
router.get("/orders", requireAuth, async (req, res) => {
  const userId = req.user!.userId;
  const role = req.user!.role;
  let orders;

  if (role === "restaurant_owner") {
    const [restaurant] = await db.select({ id: restaurantsTable.id }).from(restaurantsTable).where(eq(restaurantsTable.ownerId, userId));
    orders = restaurant
      ? await db.select().from(ordersTable).where(eq(ordersTable.restaurantId, restaurant.id)).orderBy(desc(ordersTable.createdAt))
      : [];
  } else if (role === "admin") {
    orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  } else {
    orders = await db.select().from(ordersTable).where(eq(ordersTable.customerId, userId)).orderBy(desc(ordersTable.createdAt));
  }

  res.json(orders.map(formatOrder));
});

// POST /orders — supports authenticated customers and guests.
router.post("/orders", optionalAuth, async (req, res) => {
  const body = req.body as {
    restaurantId: number;
    items: { dishId: number; quantity: number }[];
    deliveryAddress: string;
    deliveryCity: string;
    paymentMethod: "orange_money" | "moov_money" | "cash";
    guestName?: string;
    guestPhone?: string;
    deliveryLat?: number;
    deliveryLng?: number;
    useLoyaltyDiscount?: boolean;
  };

  const { restaurantId, items, deliveryAddress, deliveryCity, paymentMethod, guestName, guestPhone, deliveryLat, deliveryLng } = body;
  const authenticatedUserId = req.user?.userId;

  if (!authenticatedUserId && (!guestName?.trim() || !guestPhone?.trim())) {
    res.status(400).json({ error: "Guest name and phone are required when not logged in" });
    return;
  }
  if (!restaurantId || !Array.isArray(items) || items.length === 0 || !deliveryAddress?.trim() || !deliveryCity?.trim() || !paymentMethod) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!["orange_money", "moov_money", "cash"].includes(paymentMethod)) {
    res.status(400).json({ error: "Invalid payment method" });
    return;
  }
  if (items.some((item) => !Number.isInteger(item.dishId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50)) {
    res.status(400).json({ error: "Each item must have a valid quantity between 1 and 50" });
    return;
  }

  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, restaurantId));
  if (!restaurant || restaurant.status !== "approved") {
    res.status(400).json({ error: "Restaurant is not available" });
    return;
  }

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  for (const item of items) {
    const [dish] = await db.select().from(dishesTable).where(eq(dishesTable.id, item.dishId));
    if (!dish || dish.restaurantId !== restaurantId || !dish.available) {
      res.status(400).json({ error: `Dish ${item.dishId} is unavailable` });
      return;
    }
    const unitPrice = dish.hasPromotion && dish.promotionPrice != null ? dish.promotionPrice : dish.price;
    const totalPrice = unitPrice * item.quantity;
    subtotal += totalPrice;
    orderItems.push({ dishId: dish.id, dishName: dish.name, quantity: item.quantity, unitPrice, totalPrice });
  }

  const [customer] = authenticatedUserId
    ? await db.select().from(usersTable).where(eq(usersTable.id, authenticatedUserId))
    : [undefined];

  const discountRequested = customer && body.useLoyaltyDiscount === true && customer.loyaltyPoints >= POINTS_FOR_DISCOUNT;
  const delivery = await calculateDeliveryFee({
    city: deliveryCity,
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
    customerLat: deliveryLat,
    customerLng: deliveryLng,
  });
  const pointsEarned = Math.floor(subtotal / 1000) * POINTS_PER_1000_FCFA;

  try {
    const [order] = await db.transaction(async (tx) => {
      let discount = 0;

      if (discountRequested && authenticatedUserId) {
        const [reserved] = await tx.update(usersTable)
          .set({ loyaltyPoints: customer!.loyaltyPoints - POINTS_FOR_DISCOUNT })
          .where(and(
            eq(usersTable.id, authenticatedUserId),
            gte(usersTable.loyaltyPoints, POINTS_FOR_DISCOUNT),
          ))
          .returning({ id: usersTable.id });

        if (!reserved) {
          throw new Error("LOYALTY_POINTS_CHANGED");
        }
        discount = DISCOUNT_AMOUNT;
      }

      const total = Math.max(0, subtotal + delivery.fee - discount);
      const [created] = await tx.insert(ordersTable).values({
        trackingToken: randomUUID(),
        customerId: authenticatedUserId ?? null,
        guestName: guestName?.trim() ?? null,
        guestPhone: guestPhone?.trim() ?? null,
        restaurantId,
        restaurantName: restaurant.name,
        items: orderItems,
        status: "pending",
        subtotal,
        deliveryFee: delivery.fee,
        discount,
        total,
        deliveryAddress: deliveryAddress.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryLat: deliveryLat ?? null,
        deliveryLng: deliveryLng ?? null,
        deliveryZoneId: delivery.zoneId,
        deliveryDistanceKm: delivery.distanceKm,
        paymentMethod,
        paymentStatus: "pending",
        loyaltyPointsEarned: pointsEarned,
      }).returning();

      if (!created) throw new Error("Failed to create order");

      if (discount > 0 && authenticatedUserId) {
        await tx.insert(loyaltyHistoryTable).values({
          userId: authenticatedUserId,
          orderId: created.id,
          points: -POINTS_FOR_DISCOUNT,
          description: `Réduction de ${DISCOUNT_AMOUNT.toLocaleString()} FCFA utilisée pour la commande #${created.id}`,
        });
      }

      await tx.insert(deliveryAssignmentsTable).values({ orderId: created.id, status: "pending" });
      return [created] as const;
    });

    res.status(201).json(formatOrder(order));
  } catch (error) {
    if (error instanceof Error && error.message === "LOYALTY_POINTS_CHANGED") {
      res.status(409).json({ error: "Loyalty points changed; please retry the order" });
      return;
    }
    throw error;
  }
});

// GET /orders/:id — authenticated users or guests with the tracking token.
router.get("/orders/:id", optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  const token = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (token && token === order.trackingToken) {
    res.json(formatOrder(order));
    return;
  }
  if (!req.user) {
    res.status(401).json({ error: "Authentication or valid tracking token required" });
    return;
  }

  if (order.customerId !== req.user.userId && req.user.role !== "admin") {
    const [restaurant] = await db.select({ ownerId: restaurantsTable.ownerId }).from(restaurantsTable).where(eq(restaurantsTable.id, order.restaurantId));
    if (!restaurant || restaurant.ownerId !== req.user.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
  }
  res.json(formatOrder(order));
});

// PATCH /orders/:id/payment — restaurant/admin records the payment state.
router.patch("/orders/:id/payment", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { paymentStatus } = req.body as { paymentStatus?: "paid" | "failed" | "refunded" };

  if (!Number.isInteger(id) || !["paid", "failed", "refunded"].includes(paymentStatus ?? "")) {
    res.status(400).json({ error: "Invalid payment status" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (req.user!.role !== "admin") {
    const [restaurant] = await db.select({ ownerId: restaurantsTable.ownerId })
      .from(restaurantsTable)
      .where(eq(restaurantsTable.id, order.restaurantId));
    if (req.user!.role !== "restaurant_owner" || !restaurant || restaurant.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "Only the restaurant or an admin can update payment status" });
      return;
    }
  }

  const allowed: Record<string, string[]> = {
    pending: ["paid", "failed"],
    paid: ["refunded"],
    failed: ["paid"],
    refunded: [],
  };
  if (!allowed[order.paymentStatus]?.includes(paymentStatus!)) {
    res.status(409).json({ error: `Invalid payment transition from ${order.paymentStatus} to ${paymentStatus}` });
    return;
  }

  const [updated] = await db.update(ordersTable)
    .set({ paymentStatus: paymentStatus! })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(409).json({ error: "Payment state changed before this action could be applied" });
    return;
  }

  res.json(formatOrder(updated));
});

// PATCH /orders/:id/status — only the restaurant owner/admin controls restaurant-side status.
router.patch("/orders/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status?: string };
  if (!Number.isInteger(id) || !ORDER_STATUSES.includes(status as OrderStatus)) {
    res.status(400).json({ error: "Invalid order status" });
    return;
  }

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  if (req.user!.role !== "admin") {
    const [restaurant] = await db.select({ ownerId: restaurantsTable.ownerId }).from(restaurantsTable).where(eq(restaurantsTable.id, order.restaurantId));
    if (req.user!.role !== "restaurant_owner" || !restaurant || restaurant.ownerId !== req.user!.userId) {
      res.status(403).json({ error: "Only the restaurant or an admin can change this order status" });
      return;
    }
    const restaurantAllowed: string[] = ["confirmed", "preparing", "ready", "cancelled"];
    if (!restaurantAllowed.includes(status ?? "")) {
      res.status(403).json({ error: "The restaurant cannot set delivery-side statuses" });
      return;
    }
  }

  if (requiresPrepayment(order.paymentMethod) && order.paymentStatus !== "paid" && ["confirmed", "preparing", "ready"].includes(status)) {
    res.status(409).json({ error: "Mobile-money payment must be confirmed before the restaurant can prepare the order" });
    return;
  }

  const allowedTransitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["cancelled"],
    delivering: ["cancelled", "delivered"],
    delivered: [],
    cancelled: [],
  };
  if (!allowedTransitions[order.status]?.includes(status ?? "") && order.status !== status) {
    res.status(409).json({ error: `Invalid transition from ${order.status} to ${status}` });
    return;
  }

  if (status === "delivered") {
    const finalized = await finalizeOrderDelivery(id);
    if (!finalized) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json({ order: formatOrder(finalized) });
    return;
  }

  const [updated] = await db.update(ordersTable)
    .set({ status: status as OrderStatus })
    .where(eq(ordersTable.id, id))
    .returning();

  if (!updated) {
    res.status(500).json({ error: "Failed to update order" });
    return;
  }

  if (status === "cancelled" && order.status !== "cancelled") {
    await refundOrderLoyaltyDiscount(id);
  }

  // Once the restaurant marks the order ready, dispatch the nearest available driver.
  // If nobody is available, the order remains "ready" and can be retried by admin later.
  let dispatch = undefined;
  if (status === "ready") {
    dispatch = await assignNearestAvailableDriver(id);
  }

  res.json({ order: formatOrder(updated), dispatch });
});

export default router;
