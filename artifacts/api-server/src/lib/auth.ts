import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const SECRET = process.env["SESSION_SECRET"];

function getSecret(): string {
  if (!SECRET || SECRET.length < 32) throw new Error("SESSION_SECRET must be set and contain at least 32 characters.");
  return SECRET;
}

if (!SECRET || SECRET.length < 32) {
  throw new Error("SESSION_SECRET must be set and contain at least 32 characters.");
}

export interface JwtPayload {
  userId: number;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, getSecret());
  if (typeof decoded !== "object" || decoded === null || typeof decoded.userId !== "number" || typeof decoded.role !== "string") {
    throw new Error("Invalid token payload");
  }
  return decoded as unknown as JwtPayload;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
