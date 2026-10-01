import { pgTable, serial, integer, real, boolean, timestamp, text } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const driversTable = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id, { onDelete: "cascade" }),
  isAvailable: boolean("is_available").notNull().default(false),
  isOnline: boolean("is_online").notNull().default(false),
  currentLat: real("current_lat"),
  currentLng: real("current_lng"),
  currentCity: text("current_city"),
  vehicleType: text("vehicle_type"),
  vehiclePlate: text("vehicle_plate"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const deliveryAssignmentsTable = pgTable("delivery_assignments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().unique().references(() => ordersTable.id, { onDelete: "cascade" }),
  driverId: integer("driver_id").references(() => driversTable.id, { onDelete: "set null" }),
  status: text("status", { enum: ["pending", "assigned", "accepted", "picked_up", "delivering", "delivered", "cancelled"] }).notNull().default("pending"),
  assignedAt: timestamp("assigned_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  pickedUpAt: timestamp("picked_up_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Driver = typeof driversTable.$inferSelect;
export type DeliveryAssignment = typeof deliveryAssignmentsTable.$inferSelect;
