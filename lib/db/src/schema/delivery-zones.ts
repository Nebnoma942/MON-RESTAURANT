import { pgTable, serial, text, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";

export const deliveryZonesTable = pgTable("delivery_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  city: text("city").notNull(),
  baseFee: real("base_fee").notNull().default(1000),
  pricePerKm: real("price_per_km").notNull().default(0),
  maxDistanceKm: real("max_distance_km"),
  isActive: boolean("is_active").notNull().default(true),
  priority: integer("priority").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type DeliveryZone = typeof deliveryZonesTable.$inferSelect;
