import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, restaurantsTable, ordersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import type { Request, Response, NextFunction } from "express";

const router: IRouter = Router();

// Middleware: require admin role
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// GET /admin/stats — platform-wide stats
router.get("/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
  const [users, restaurants, orders] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(restaurantsTable),
    db.select().from(ordersTable),
  ]);

  const totalRevenue = orders
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(o => o.createdAt >= today);
  const todayRevenue = todayOrders
    .filter(o => o.status === "delivered")
    .reduce((s, o) => s + (o.total ?? 0), 0);

  const pendingRestaurants = restaurants.filter(r => r.status === "pending").length;
  const approvedRestaurants = restaurants.filter(r => r.status === "approved").length;
  const suspendedRestaurants = restaurants.filter(r => r.status === "suspended").length;

  const ordersByStatus = {
    pending: orders.filter(o => o.status === "pending").length,
    confirmed: orders.filter(o => o.status === "confirmed").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
    delivering: orders.filter(o => o.status === "delivering").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  res.json({
    users: {
      total: users.length,
      clients: users.filter(u => u.role === "client").length,
      restaurantOwners: users.filter(u => u.role === "restaurant_owner").length,
      admins: users.filter(u => u.role === "admin").length,
    },
    restaurants: {
      total: restaurants.length,
      pending: pendingRestaurants,
      approved: approvedRestaurants,
      suspended: suspendedRestaurants,
    },
    orders: {
      total: orders.length,
      today: todayOrders.length,
      byStatus: ordersByStatus,
    },
    revenue: {
      total: totalRevenue,
      today: todayRevenue,
      commission: Math.round(totalRevenue * 0.08),
    },
  });
});

// GET /admin/restaurants — all restaurants with owner info
router.get("/admin/restaurants", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: restaurantsTable.id,
      name: restaurantsTable.name,
      type: restaurantsTable.type,
      city: restaurantsTable.city,
      phone: restaurantsTable.phone,
      email: restaurantsTable.email,
      status: restaurantsTable.status,
      rating: restaurantsTable.rating,
      reviewCount: restaurantsTable.reviewCount,
      ownerId: restaurantsTable.ownerId,
      ownerName: usersTable.name,
      ownerPhone: usersTable.phone,
      createdAt: restaurantsTable.createdAt,
    })
    .from(restaurantsTable)
    .leftJoin(usersTable, eq(restaurantsTable.ownerId, usersTable.id))
    .orderBy(desc(restaurantsTable.createdAt));

  res.json(rows.map(r => ({ ...r, createdAt: r.createdAt.toISOString() })));
});

// PATCH /admin/restaurants/:id/status — approve / suspend / pending
router.patch("/admin/restaurants/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string ?? "0", 10);
  const { status } = req.body as { status: "pending" | "approved" | "suspended" };
  if (!["pending", "approved", "suspended"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  const [updated] = await db
    .update(restaurantsTable)
    .set({ status })
    .where(eq(restaurantsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Restaurant not found" });
    return;
  }
  res.json({ id: updated.id, status: updated.status });
});

// GET /admin/users — all users (without passwordHash)
router.get("/admin/users", requireAuth, requireAdmin, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      phone: usersTable.phone,
      email: usersTable.email,
      role: usersTable.role,
      loyaltyPoints: usersTable.loyaltyPoints,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt));

  res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
});

// PATCH /admin/users/:id/role — change user role
router.patch("/admin/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const id = parseInt(req.params["id"] as string ?? "0", 10);
  const { role } = req.body as { role: "client" | "restaurant_owner" | "admin" };
  if (!["client", "restaurant_owner", "driver", "admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id, role: usersTable.role });
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

// GET /admin/orders — all platform orders with customer + restaurant name
router.get("/admin/orders", requireAuth, requireAdmin, async (_req, res) => {
  const orders = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt));

  res.json(orders.map(o => ({
    id: o.id,
    customerId: o.customerId,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurantName,
    status: o.status,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    deliveryCity: o.deliveryCity,
    paymentMethod: o.paymentMethod,
    itemCount: Array.isArray(o.items) ? (o.items as any[]).length : 0,
    createdAt: o.createdAt.toISOString(),
  })));
});

export default router;
