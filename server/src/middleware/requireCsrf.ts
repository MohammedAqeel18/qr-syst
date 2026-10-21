
import { timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

export function requireCsrf(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Safe methods do not change server data.
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  const sessionToken = req.session.csrfToken;
  const requestToken = req.get("X-CSRF-Token");

  if (!sessionToken || !requestToken) {
    res.status(403).json({
      success: false,
      message: "CSRF token is missing."
    });
    return;
  }

  const sessionBuffer = Buffer.from(sessionToken, "utf8");
  const requestBuffer = Buffer.from(requestToken, "utf8");

  // Check lengths before comparing buffers.
  if (
    sessionBuffer.length !== requestBuffer.length ||
    !timingSafeEqual(sessionBuffer, requestBuffer)
  ) {
    res.status(403).json({
      success: false,
      message: "Invalid CSRF token."
    });
    return;
  }

  next();
}
