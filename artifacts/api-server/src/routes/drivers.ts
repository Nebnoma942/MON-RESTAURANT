import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { driversTable, deliveryAssignmentsTable, ordersTable, restaurantsTable, usersTable, loyaltyHistoryTable } from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { assignNearestAvailableDriver } from "../lib/dispatch";

const router: IRouter = Router();

function requireDriver(req: Parameters<typeof requireAuth>[0], res: Parameters<typeof requireAuth>[1], next: Parameters<typeof requireAuth>[2]): void {
  if (!req.user || req.user.role !== "driver") {
    res.status(403).json({ error: "Driver access required" });
    return;
  }
  next();
}

router.get("/drivers/me", requireAuth, requireDriver, async (req, res) => {
  const [driver] = await db.select().from(driversTable).where(eq(driversTable.userId, req.user!.userId));
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }
  res.json(driver);
});

router.post("/drivers/me", requireAuth, requireDriver, async (req, res) => {
  const { vehicleType, vehiclePlate } = req.body as { vehicleType?: string; vehiclePlate?: string };
  const [existing] = await db.select().from(driversTable).where(eq(driversTable.userId, req.user!.userId));
  if (existing) {
    res.status(409).json({ error: "Driver profile already exists" });
    return;
  }
  const [driver] = await db.insert(driversTable).values({
    userId: req.user!.userId,
    vehicleType: vehicleType ?? null,
    vehiclePlate: vehiclePlate ?? null,
  }).returning();
  res.status(201).json(driver);
});

router.patch("/drivers/me/status", requireAuth, requireDriver, async (req, res) => {
  const { isOnline, isAvailable } = req.body as { isOnline?: boolean; isAvailable?: boolean };
  const [driver] = await db.update(driversTable).set({
    ...(isOnline !== undefined && { isOnline }),
    ...(isAvailable !== undefined && { isAvailable }),
  }).where(eq(driversTable.userId, req.user!.userId)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }

  // When a driver becomes available, retry ready orders that previously had no driver.
  const shouldDispatch = (isOnline === true || isAvailable === true) && driver.isOnline && driver.isAvailable;
  let dispatches: unknown[] = [];
  if (shouldDispatch) {
    const readyOrders = await db.select({ id: ordersTable.id })
      .from(ordersTable)
      .where(eq(ordersTable.status, "ready"))
      .orderBy(desc(ordersTable.createdAt));
    for (const order of readyOrders.slice(0, 20)) {
      const result = await assignNearestAvailableDriver(order.id);
      if (result.ok) dispatches.push(result.assignment);
    }
  }

  res.json({ driver, dispatches });
});

router.patch("/drivers/me/location", requireAuth, requireDriver, async (req, res) => {
  const { lat, lng, city } = req.body as { lat?: number; lng?: number; city?: string };
  if (typeof lat !== "number" || typeof lng !== "number") {
    res.status(400).json({ error: "lat and lng are required" });
    return;
  }
  const [driver] = await db.update(driversTable).set({ currentLat: lat, currentLng: lng, currentCity: city ?? null }).where(eq(driversTable.userId, req.user!.userId)).returning();
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }
  res.json(driver);
});

router.get("/drivers/me/deliveries", requireAuth, requireDriver, async (req, res) => {
  const [driver] = await db.select().from(driversTable).where(eq(driversTable.userId, req.user!.userId));
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }
  const rows = await db.select().from(deliveryAssignmentsTable).where(eq(deliveryAssignmentsTable.driverId, driver.id)).orderBy(desc(deliveryAssignmentsTable.createdAt));
  res.json(rows);
});

router.patch("/drivers/me/deliveries/:id/status", requireAuth, requireDriver, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: "accepted" | "picked_up" | "delivering" | "delivered" | "cancelled" };
  const allowed = ["accepted", "picked_up", "delivering", "delivered", "cancelled"];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: "Invalid delivery status" });
    return;
  }
  const [driver] = await db.select().from(driversTable).where(eq(driversTable.userId, req.user!.userId));
  if (!driver) {
    res.status(404).json({ error: "Driver profile not found" });
    return;
  }
  const [assignment] = await db.select().from(deliveryAssignmentsTable).where(eq(deliveryAssignmentsTable.id, id));
  if (!assignment || assignment.driverId !== driver.id) {
    res.status(404).json({ error: "Delivery assignment not found" });
    return;
  }
  const assignmentTransitions: Record<string, string[]> = {
    assigned: ["accepted", "cancelled"],
    accepted: ["picked_up", "cancelled"],
    picked_up: ["delivering", "cancelled"],
    delivering: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };
  if (!assignmentTransitions[assignment.status]?.includes(status) && assignment.status !== status) {
    res.status(409).json({ error: `Invalid delivery transition from ${assignment.status} to ${status}` });
    return;
  }

  const now = new Date();
  const [updated] = await db.update(deliveryAssignmentsTable).set({
    status,
    ...(status === "accepted" && { acceptedAt: now }),
    ...(status === "picked_up" && { pickedUpAt: now }),
    ...(status === "delivered" && { deliveredAt: now }),
  }).where(and(eq(deliveryAssignmentsTable.id, id), eq(deliveryAssignmentsTable.driverId, driver.id))).returning();
  if (!updated) {
    res.status(409).json({ error: "Delivery assignment changed before this action could be applied" });
    return;
  }

  if (status === "delivered") {
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(ordersTable).where(eq(ordersTable.id, assignment.orderId));
      if (order && order.status !== "delivered") {
        await tx.update(ordersTable)
          .set({ status: "delivered" })
          .where(eq(ordersTable.id, assignment.orderId));

        if (order.customerId && order.loyaltyPointsEarned > 0) {
          await tx.update(usersTable)
            .set({
              loyaltyPoints: sql`GREATEST(0, ${usersTable.loyaltyPoints} + ${order.loyaltyPointsEarned})`,
            })
            .where(eq(usersTable.id, order.customerId));
          await tx.insert(loyaltyHistoryTable).values({
            userId: order.customerId,
            orderId: order.id,
            points: order.loyaltyPointsEarned,
            description: `Points gagnés pour la commande #${order.id}`,
          });
        }
      }
    });
    await db.update(driversTable).set({ isAvailable: true }).where(eq(driversTable.id, driver.id));
  } else if (status === "cancelled") {
    // A driver cancellation does not cancel the customer's order. Put the delivery
    // back in the queue so another available driver can take it.
    await db.update(driversTable).set({ isAvailable: true }).where(eq(driversTable.id, driver.id));
    await db.update(deliveryAssignmentsTable).set({ driverId: null, status: "pending", assignedAt: null }).where(eq(deliveryAssignmentsTable.id, id));
    const reassigned = await assignNearestAvailableDriver(assignment.orderId);
    res.json({ assignment: reassigned.ok ? reassigned.assignment : updated, reassigned: reassigned.ok });
    return;
  } else if (status === "picked_up" || status === "delivering") {
    await db.update(ordersTable).set({ status: "delivering" }).where(eq(ordersTable.id, assignment.orderId));
  }
  res.json(updated);
});


// POST /deliveries/:orderId/assign — admin can manually retry dispatch.
router.post("/deliveries/:orderId/assign", requireAuth, async (req, res) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  const orderId = Number(req.params.orderId);
  if (!Number.isInteger(orderId) || orderId <= 0) {
    res.status(400).json({ error: "Invalid order id" });
    return;
  }

  const result = await assignNearestAvailableDriver(orderId);
  if (!result.ok) {
    const status = result.reason === "order_not_found" || result.reason === "assignment_not_found" ? 404 : 409;
    res.status(status).json({ error: result.reason });
    return;
  }
  res.json({ assignment: result.assignment, driver: result.driver, distanceKm: result.distanceKm });
});

export default router;
