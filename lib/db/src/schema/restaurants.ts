import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const restaurantsTable = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  phone: text("phone").notNull(),
  email: text("email"),
  openingHours: text("opening_hours").notNull(),
  imageUrl: text("image_url"),
  status: text("status", { enum: ["pending", "approved", "suspended"] }).notNull().default("pending"),
  rating: real("rating"),
  reviewCount: integer("review_count").notNull().default(0),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRestaurantSchema = createInsertSchema(restaurantsTable).omit({ id: true, createdAt: true, updatedAt: true, rating: true, reviewCount: true });
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type Restaurant = typeof restaurantsTable.$inferSelect;
