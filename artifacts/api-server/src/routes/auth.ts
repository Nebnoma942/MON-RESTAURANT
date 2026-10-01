import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, driversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  const { name, phone, email, password, role } = req.body as {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: "client" | "restaurant_owner" | "driver";
  };

  if (!name || !phone || !password || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.phone, phone));
  if (existing.length > 0) {
    res.status(409).json({ error: "Phone number already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ name, phone, email: email || null, passwordHash, role }).returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  if (user.role === "driver") {
    await db.insert(driversTable).values({ userId: user.id });
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body as { phone: string; password: string };

  if (!phone || !password) {
    res.status(400).json({ error: "Missing phone or password" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
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

export default router;
