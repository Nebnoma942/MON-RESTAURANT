import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, dishesTable, restaurantsTable, usersTable, loyaltyHistoryTable, deliveryAssignmentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { requireAuth } from "../lib/auth";
import { optionalAuth } from "../lib/optional-auth";
import { calculateDeliveryFee } from "../lib/delivery-fee";
import { assignNearestAvailableDriver } from "../lib/dispatch";
import type { OrderItem } from "@workspace/db";

const router: IRouter = Router();
const POINTS_PER_1000_FCFA = 1;
const POINTS_FOR_DISCOUNT = 15;
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

  let discount = 0;
  if (customer && body.useLoyaltyDiscount === true && customer.loyaltyPoints >= POINTS_FOR_DISCOUNT) {
    discount = DISCOUNT_AMOUNT;
  }

  const delivery = await calculateDeliveryFee({
    city: deliveryCity,
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
    customerLat: deliveryLat,
    customerLng: deliveryLng,
  });
  const total = Math.max(0, subtotal + delivery.fee - discount);
  const pointsEarned = Math.floor(subtotal / 1000) * POINTS_PER_1000_FCFA;

  const [order] = await db.transaction(async (tx) => {
    if (discount > 0 && authenticatedUserId && customer) {
      await tx.update(usersTable)
        .set({ loyaltyPoints: customer.loyaltyPoints - POINTS_FOR_DISCOUNT })
        .where(eq(usersTable.id, authenticatedUserId));
      await tx.insert(loyaltyHistoryTable).values({
        userId: authenticatedUserId,
        orderId: null,
        points: -POINTS_FOR_DISCOUNT,
        description: `Réduction de ${DISCOUNT_AMOUNT.toLocaleString()} FCFA réservée pour une commande`,
      });
    }

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
    await tx.insert(deliveryAssignmentsTable).values({ orderId: created.id, status: "pending" });
    return [created] as const;
  });

  res.status(201).json(formatOrder(order));
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
    const restaurantAllowed = ["confirmed", "preparing", "ready", "cancelled"];
    if (!restaurantAllowed.includes(status)) {
      res.status(403).json({ error: "The restaurant cannot set delivery-side statuses" });
      return;
    }
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
  if (!allowedTransitions[order.status]?.includes(status) && order.status !== status) {
    res.status(409).json({ error: `Invalid transition from ${order.status} to ${status}` });
    return;
  }

  const [updated] = await db.update(ordersTable).set({ status: status as OrderStatus }).where(eq(ordersTable.id, id)).returning();
  if (!updated) {
    res.status(500).json({ error: "Failed to update order" });
    return;
  }

  if (status === "delivered" && order.status !== "delivered" && order.customerId && updated.loyaltyPointsEarned > 0) {
    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId));
    if (customer) {
      await db.update(usersTable).set({ loyaltyPoints: customer.loyaltyPoints + updated.loyaltyPointsEarned }).where(eq(usersTable.id, order.customerId));
      await db.insert(loyaltyHistoryTable).values({
        userId: order.customerId,
        orderId: order.id,
        points: updated.loyaltyPointsEarned,
        description: `Points gagnés pour la commande #${order.id}`,
      });
    }
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
