import { Router, type IRouter } from "express";
import { db, deliveryZonesTable, restaurantsTable } from "@workspace/db";
import { and, asc, eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { calculateDeliveryFee } from "../lib/delivery-fee";

const router: IRouter = Router();

// Public checkout quote. The client can call this before creating an order.
router.get("/delivery/quote", async (req, res) => {
  const restaurantId = Number(req.query.restaurantId);
  const city = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const lat = typeof req.query.lat === "string" ? Number(req.query.lat) : undefined;
  const lng = typeof req.query.lng === "string" ? Number(req.query.lng) : undefined;

  if (!Number.isInteger(restaurantId) || restaurantId <= 0 || !city) {
    res.status(400).json({ error: "restaurantId and city are required" });
    return;
  }

  const [restaurant] = await db.select({ lat: restaurantsTable.lat, lng: restaurantsTable.lng, city: restaurantsTable.city })
    .from(restaurantsTable)
    .where(eq(restaurantsTable.id, restaurantId));
  if (!restaurant) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }

  const quote = await calculateDeliveryFee({
    city,
    restaurantLat: restaurant.lat,
    restaurantLng: restaurant.lng,
    customerLat: Number.isFinite(lat) ? lat : null,
    customerLng: Number.isFinite(lng) ? lng : null,
  });

  res.json({
    ...quote,
    currency: "FCFA",
    minimumFee: 1000,
    restaurantCity: restaurant.city,
  });
});

// Admin manages delivery zones and pricing rules.
router.get("/admin/delivery-zones", requireAuth, async (req, res) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const zones = await db.select().from(deliveryZonesTable).orderBy(asc(deliveryZonesTable.city), asc(deliveryZonesTable.priority));
  res.json(zones);
});

router.post("/admin/delivery-zones", requireAuth, async (req, res) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const { name, city, baseFee, pricePerKm, maxDistanceKm, priority } = req.body as {
    name?: string;
    city?: string;
    baseFee?: number;
    pricePerKm?: number;
    maxDistanceKm?: number | null;
    priority?: number;
  };
  if (!name?.trim() || !city?.trim() || typeof baseFee !== "number" || baseFee < 1000 || typeof pricePerKm !== "number" || pricePerKm < 0) {
    res.status(400).json({ error: "name, city, baseFee >= 1000 and pricePerKm are required" });
    return;
  }
  const [zone] = await db.insert(deliveryZonesTable).values({
    name: name.trim(),
    city: city.trim(),
    baseFee,
    pricePerKm,
    maxDistanceKm: maxDistanceKm ?? null,
    priority: priority ?? 0,
    isActive: true,
  }).returning();
  res.status(201).json(zone);
});

router.patch("/admin/delivery-zones/:id", requireAuth, async (req, res) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const id = Number(req.params.id);
  const { name, city, baseFee, pricePerKm, maxDistanceKm, priority, isActive } = req.body as Record<string, unknown>;
  const updates: Partial<typeof deliveryZonesTable.$inferInsert> = {};
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof city === "string" && city.trim()) updates.city = city.trim();
  if (typeof baseFee === "number" && baseFee >= 1000) updates.baseFee = baseFee;
  if (typeof pricePerKm === "number" && pricePerKm >= 0) updates.pricePerKm = pricePerKm;
  if (typeof maxDistanceKm === "number" || maxDistanceKm === null) updates.maxDistanceKm = maxDistanceKm;
  if (typeof priority === "number") updates.priority = priority;
  if (typeof isActive === "boolean") updates.isActive = isActive;

  if (!Number.isInteger(id) || Object.keys(updates).length === 0) {
    res.status(400).json({ error: "Valid zone id and at least one valid field are required" });
    return;
  }
  const [zone] = await db.update(deliveryZonesTable).set(updates).where(eq(deliveryZonesTable.id, id)).returning();
  if (!zone) {
    res.status(404).json({ error: "Delivery zone not found" });
    return;
  }
  res.json(zone);
});

export default router;
