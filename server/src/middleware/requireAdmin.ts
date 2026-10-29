
import type { RequestHandler } from "express";
import { AdminModel } from "../models/admin.model.ts";

export const requireAdmin: RequestHandler = async (
  req,
  res,
  next
) => {
  const adminId = req.session.adminId;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const admin = await AdminModel.findById(adminId)
      .select("_id role");

    if (!admin || admin.role !== "admin") {
      req.session.destroy((error) => {
        if (error) {
          next(error);
          return;
        }

        res.clearCookie("qr.sid", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          path: "/",
        });

        res.status(401).json({
          success: false,
          message: "Administrator session is no longer valid.",
        });
      });

      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
