import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "./auth";

/** Authenticate when a valid bearer token is supplied, but allow guests through. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    req.user = verifyToken(authHeader.slice(7));
    next();
  } catch {
    _res.status(401).json({ error: "Invalid or expired token" });
  }
}
