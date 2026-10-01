import { pgTable, serial, text, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { restaurantsTable } from "./restaurants";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  trackingToken: text("tracking_token").unique(),
  customerId: integer("customer_id").references(() => usersTable.id),
  guestName: text("guest_name"),
  guestPhone: text("guest_phone"),
  restaurantId: integer("restaurant_id").notNull().references(() => restaurantsTable.id),
  restaurantName: text("restaurant_name").notNull(),
  items: jsonb("items").notNull().$type<OrderItem[]>(),
  status: text("status", {
    enum: ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"],
  }).notNull().default("pending"),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(1500),
  discount: real("discount").notNull().default(0),
  total: real("total").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: text("delivery_city").notNull(),
  deliveryLat: real("delivery_lat"),
  deliveryLng: real("delivery_lng"),
  deliveryZoneId: integer("delivery_zone_id"),
  deliveryDistanceKm: real("delivery_distance_km"),
  paymentMethod: text("payment_method", { enum: ["orange_money", "moov_money", "cash"] }).notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export interface OrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
