import type { RequestHandler } from "express";

export const checkOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get("Origin");
  const allowedOrigin = process.env.FRONTEND_ORIGIN;

  if (origin && origin !== allowedOrigin) {
    res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
    return;
  }

  next();
};