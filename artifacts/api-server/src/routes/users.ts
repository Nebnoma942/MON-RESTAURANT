import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, addressesTable, loyaltyHistoryTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

// PATCH /users/me
router.patch("/users/me", requireAuth, async (req, res) => {
  const { name, email } = req.body as { name?: string; email?: string };
  const [user] = await db.update(usersTable).set({
    ...(name && { name }),
    ...(email !== undefined && { email: email || null }),
  }).where(eq(usersTable.id, req.user!.userId)).returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    createdAt: user.createdAt.toISOString(),
  });
});

// GET /users/me/loyalty
router.get("/users/me/loyalty", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const history = await db.select().from(loyaltyHistoryTable)
    .where(eq(loyaltyHistoryTable.userId, req.user!.userId))
    .orderBy(desc(loyaltyHistoryTable.createdAt))
    .limit(50);

  res.json({
    points: user.loyaltyPoints,
    history: history.map(h => ({
      id: h.id,
      points: h.points,
      description: h.description,
      createdAt: h.createdAt.toISOString(),
    })),
  });
});

// GET /users/me/addresses
router.get("/users/me/addresses", requireAuth, async (req, res) => {
  const addresses = await db.select().from(addressesTable).where(eq(addressesTable.userId, req.user!.userId));
  res.json(addresses.map(a => ({
    id: a.id,
    label: a.label,
    address: a.address,
    city: a.city,
    isDefault: a.isDefault,
  })));
});

// POST /users/me/addresses
router.post("/users/me/addresses", requireAuth, async (req, res) => {
  const { label, address, city, isDefault } = req.body as {
    label: string;
    address: string;
    city: string;
    isDefault?: boolean;
  };
  if (!label || !address || !city) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const [addr] = await db.insert(addressesTable).values({
    userId: req.user!.userId,
    label,
    address,
    city,
    isDefault: isDefault ?? false,
  }).returning();
  res.status(201).json({
    id: addr!.id,
    label: addr!.label,
    address: addr!.address,
    city: addr!.city,
    isDefault: addr!.isDefault,
  });
});

// DELETE /users/me/addresses/:id
router.delete("/users/me/addresses/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string ?? "0", 10);
  const deleted = await db.delete(addressesTable)
    .where(eq(addressesTable.id, id))
    .returning();
  if (deleted.length === 0) {
    res.status(404).json({ error: "Address not found" });
    return;
  }
  res.status(204).end();
});

export default router;
