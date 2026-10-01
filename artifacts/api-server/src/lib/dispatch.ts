import { db } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { deliveryAssignmentsTable, driversTable, ordersTable } from "@workspace/db";
import { haversineKm } from "./delivery-fee";

export async function assignNearestAvailableDriver(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  if (!order) return { ok: false as const, reason: "order_not_found" as const };

  const [assignment] = await db.select().from(deliveryAssignmentsTable).where(eq(deliveryAssignmentsTable.orderId, orderId));
  if (!assignment) return { ok: false as const, reason: "assignment_not_found" as const };
  if (assignment.driverId != null && ["assigned", "accepted", "picked_up", "delivering"].includes(assignment.status)) {
    return { ok: false as const, reason: "already_assigned" as const, assignment };
  }

  const candidates = await db.select().from(driversTable).where(
    and(eq(driversTable.isOnline, true), eq(driversTable.isAvailable, true)),
  );
  if (candidates.length === 0) return { ok: false as const, reason: "no_available_driver" as const };

  const ranked = candidates.map((driver) => ({
    driver,
    distanceKm:
      driver.currentLat != null && driver.currentLng != null && order.deliveryLat != null && order.deliveryLng != null
        ? haversineKm(driver.currentLat, driver.currentLng, order.deliveryLat, order.deliveryLng)
        : Number.POSITIVE_INFINITY,
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  const selected = ranked[0]!.driver;
  const [claimed] = await db.update(driversTable).set({ isAvailable: false }).where(
    and(eq(driversTable.id, selected.id), eq(driversTable.isOnline, true), eq(driversTable.isAvailable, true)),
  ).returning();

  if (!claimed) return { ok: false as const, reason: "driver_taken" as const };

  const now = new Date();
  const [updated] = await db.update(deliveryAssignmentsTable).set({
    driverId: claimed.id,
    status: "assigned",
    assignedAt: now,
  }).where(eq(deliveryAssignmentsTable.id, assignment.id)).returning();

  if (!updated) {
    await db.update(driversTable).set({ isAvailable: true }).where(eq(driversTable.id, claimed.id));
    return { ok: false as const, reason: "assignment_failed" as const };
  }

  return { ok: true as const, assignment: updated, driver: claimed, distanceKm: ranked[0]!.distanceKm };
}
