import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const loyaltyHistoryTable = pgTable("loyalty_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  orderId: integer("order_id").references(() => ordersTable.id),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LoyaltyHistory = typeof loyaltyHistoryTable.$inferSelect;
