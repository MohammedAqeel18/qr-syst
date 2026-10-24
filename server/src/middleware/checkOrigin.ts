
import type { RequestHandler } from "express";

const allowedOrigins = [
  "http://localhost:3000",
  "https://qr-syst.vercel.app",
];

export const checkOrigin: RequestHandler = (req, res, next) => {
  const origin = req.get("Origin");

  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({
      success: false,
      message: "Origin not allowed.",
    });
    return;
  }

  next();
};
