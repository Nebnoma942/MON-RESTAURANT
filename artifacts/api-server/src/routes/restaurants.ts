import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { restaurantsTable, dishesTable, ordersTable } from "@workspace/db";
import { eq, desc, and, gte, lt } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

function formatRestaurant(r: typeof restaurantsTable.$inferSelect) {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    description: r.description,
    address: r.address,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    phone: r.phone,
    email: r.email,
    openingHours: r.openingHours,
    imageUrl: r.imageUrl,
    status: r.status,
    rating: r.rating,
    reviewCount: r.reviewCount,
    ownerId: r.ownerId,
    createdAt: r.createdAt.toISOString(),
  };
}

// GET /restaurants — list approved
router.get("/restaurants", async (_req, res) => {
  const restaurants = await db.select().from(restaurantsTable).where(eq(restaurantsTable.status, "approved")).orderBy(desc(restaurantsTable.createdAt));
  res.json(restaurants.map(formatRestaurant));
});

// POST /restaurants — create (requires auth)
router.post("/restaurants", requireAuth, async (req, res) => {
  const { name, type, description, address, city, lat, lng, phone, email, openingHours, imageUrl } = req.body;
  if (!name || !type || !address || !city || !phone || !openingHours) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [restaurant] = await db.insert(restaurantsTable).values({
    name, type, description, address, city, lat, lng, phone, email, openingHours, imageUrl,
    ownerId: req.user!.userId,
    status: "pending",
  }).returning();
  res.status(201).json(formatRestaurant(restaurant!));
});

// GET /restaurants/mine — get own restaurant
router.get("/restaurants/mine", requireAuth, async (req, res) => {
  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.ownerId, req.user!.userId));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  const dishes = await db.select().from(dishesTable).where(eq(dishesTable.restaurantId, restaurant.id));
  res.json({ ...formatRestaurant(restaurant), dishes: dishes.map(formatDish) });
});

// GET /restaurants/:id — get restaurant with dishes
router.get("/restaurants/:id", async (req, res) => {
  const id = parseInt(req.params["id"] as string ?? "0", 10);
  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, id));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  const dishes = await db.select().from(dishesTable).where(eq(dishesTable.restaurantId, id));
  res.json({ ...formatRestaurant(restaurant), dishes: dishes.map(formatDish) });
});

// PATCH /restaurants/:id — update
router.patch("/restaurants/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string ?? "0", 10);
  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, id));
  if (!restaurant) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (restaurant.ownerId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const { name, type, description, address, city, lat, lng, phone, email, openingHours, imageUrl } = req.body;
  const [updated] = await db.update(restaurantsTable).set({
    ...(name && { name }),
    ...(type && { type }),
    ...(description !== undefined && { description }),
    ...(address && { address }),
    ...(city && { city }),
    ...(lat !== undefined && { lat }),
    ...(lng !== undefined && { lng }),
    ...(phone && { phone }),
    ...(email !== undefined && { email }),
    ...(openingHours && { openingHours }),
    ...(imageUrl !== undefined && { imageUrl }),
  }).where(eq(restaurantsTable.id, id)).returning();
  res.json(formatRestaurant(updated!));
});

// GET /restaurants/:restaurantId/stats
router.get("/restaurants/:restaurantId/stats", requireAuth, async (req, res) => {
  const restaurantId = parseInt(req.params["restaurantId"] as string ?? "0", 10);
  const [restaurant] = await db.select().from(restaurantsTable).where(eq(restaurantsTable.id, restaurantId));
  if (!restaurant) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (restaurant.ownerId !== req.user!.userId && req.user!.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.restaurantId, restaurantId));
  const completedOrders = orders.filter(o => o.status === "delivered");
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const commissionOwed = totalRevenue * 0.08;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayOrders = orders.filter(o => o.createdAt >= today && o.createdAt < tomorrow);
  const todayRevenue = todayOrders.filter(o => o.status === "delivered").reduce((s, o) => s + (o.subtotal ?? 0), 0);

  res.json({
    totalOrders: orders.length,
    completedOrders: completedOrders.length,
    totalRevenue,
    commissionOwed,
    averageRating: restaurant.rating,
    todayOrders: todayOrders.length,
    todayRevenue,
  });
});

function formatDish(d: typeof dishesTable.$inferSelect) {
  return {
    id: d.id,
    restaurantId: d.restaurantId,
    name: d.name,
    description: d.description,
    price: d.price,
    category: d.category,
    imageUrl: d.imageUrl,
    available: d.available,
    hasPromotion: d.hasPromotion,
    promotionPrice: d.promotionPrice,
    createdAt: d.createdAt.toISOString(),
  };
}

// GET /restaurants/:restaurantId/dishes
router.get("/restaurants/:restaurantId/dishes", async (req, res) => {
  const restaurantId = parseInt(req.params["restaurantId"] as string ?? "0", 10);
  const dishes = await db.select().from(dishesTable).where(eq(dishesTable.restaurantId, restaurantId));
  res.json(dishes.map(formatDish));
});

// POST /restaurants/:restaurantId/dishes
router.post("/restaurants/:restaurantId/dishes", requireAuth, async (req, res) => {
  const restaurantId = parseInt(req.params["restaurantId"] as string ?? "0", 10);
  const { name, description, price, category, imageUrl, available, hasPromotion, promotionPrice } = req.body;
  if (!name || price == null || !category) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [dish] = await db.insert(dishesTable).values({
    restaurantId, name, description, price, category, imageUrl,
    available: available ?? true,
    hasPromotion: hasPromotion ?? false,
    promotionPrice: promotionPrice ?? null,
  }).returning();
  res.status(201).json(formatDish(dish!));
});

// PATCH /restaurants/:restaurantId/dishes/:dishId
router.patch("/restaurants/:restaurantId/dishes/:dishId", requireAuth, async (req, res) => {
  const dishId = parseInt(req.params["dishId"] as string ?? "0", 10);
  const { name, description, price, category, imageUrl, available, hasPromotion, promotionPrice } = req.body;
  const [dish] = await db.update(dishesTable).set({
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(price != null && { price }),
    ...(category && { category }),
    ...(imageUrl !== undefined && { imageUrl }),
    ...(available !== undefined && { available }),
    ...(hasPromotion !== undefined && { hasPromotion }),
    ...(promotionPrice !== undefined && { promotionPrice }),
  }).where(eq(dishesTable.id, dishId)).returning();
  if (!dish) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.json(formatDish(dish));
});

// DELETE /restaurants/:restaurantId/dishes/:dishId
router.delete("/restaurants/:restaurantId/dishes/:dishId", requireAuth, async (req, res) => {
  const dishId = parseInt(req.params["dishId"] as string ?? "0", 10);
  const deleted = await db.delete(dishesTable).where(eq(dishesTable.id, dishId)).returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Dish not found" });
    return;
  }
  res.status(204).end();
});

export { formatDish };
export default router;
