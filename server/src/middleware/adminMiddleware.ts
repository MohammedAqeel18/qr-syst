
import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (
  req,
  res,
  next
) => {
  if (!req.session.adminId) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  next();
};
