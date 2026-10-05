import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, driversTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth } from "../lib/auth";

const PROFESSIONAL_ROLES = ["admin", "restaurant_owner", "driver"] as const;

const router: IRouter = Router();
const PUBLIC_REGISTRATION_ROLES = ["client", "restaurant_owner"] as const;
type PublicRegistrationRole = typeof PUBLIC_REGISTRATION_ROLES[number];

router.post("/auth/register", async (req, res) => {
  const { name, phone, email, password, role } = req.body as {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    password?: unknown;
    role?: unknown;
  };

  if (
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    res.status(400).json({ error: "Invalid registration payload" });
    return;
  }

  if (!PUBLIC_REGISTRATION_ROLES.includes(role as PublicRegistrationRole)) {
    res.status(400).json({ error: "Invalid registration role" });
    return;
  }

  const normalizedName = name.trim();
  const normalizedPhone = phone.trim();
  const normalizedEmail = typeof email === "string" ? email.trim() : null;

  if (!normalizedName || !normalizedPhone || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.phone, normalizedPhone));
  if (existing.length > 0) {
    res.status(409).json({ error: "Phone number already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name: normalizedName,
    phone: normalizedPhone,
    email: normalizedEmail,
    passwordHash,
    role: role as PublicRegistrationRole,
  }).returning();

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
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

router.post("/auth/google", async (req, res) => {
  const { credential } = req.body as { credential?: unknown };
  if (typeof credential !== "string" || !credential.trim()) {
    res.status(400).json({ error: "Missing Google credential" });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    res.status(503).json({ error: "Google authentication is not configured" });
    return;
  }

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
    );
    if (!response.ok) {
      res.status(401).json({ error: "Invalid Google credential" });
      return;
    }

    const googleUser = await response.json() as {
      aud?: string;
      email?: string;
      email_verified?: string;
      name?: string;
    };

    if (googleUser.aud !== clientId || googleUser.email_verified !== "true" || !googleUser.email) {
      res.status(401).json({ error: "Google account could not be verified" });
      return;
    }

    const email = googleUser.email.trim().toLowerCase();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user || !PROFESSIONAL_ROLES.includes(user.role as typeof PROFESSIONAL_ROLES[number])) {
      res.status(403).json({ error: "Cette adresse Google n'est pas autorisée pour un compte professionnel." });
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
  } catch {
    res.status(502).json({ error: "Google authentication service unavailable" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { phone, password } = req.body as { phone?: unknown; password?: unknown };

  if (typeof phone !== "string" || typeof password !== "string" || !phone.trim() || !password) {
    res.status(400).json({ error: "Missing phone or password" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone.trim()));
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
