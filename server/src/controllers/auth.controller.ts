
import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { AdminModel } from "../models/admin.model.ts";

export const login: RequestHandler = async (
  req,
  res,
  next
) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length > 128
  ) {
    res.status(400).json({
      success: false,
      message: "Valid email and password are required.",
    });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const admin = await AdminModel.findOne({
      email: normalizedEmail,
    }).select("+passwordHash");

    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    req.session.regenerate((error) => {
      if (error) {
        next(error);
        return;
      }

      req.session.adminId = admin._id.toString();

      req.session.save((saveError) => {
        if (saveError) {
          next(saveError);
          return;
        }

        res.status(200).json({
          success: true,
          message: "Login successful.",
          admin: {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
          },
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("qr.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  });
};

export const getCurrentAdmin: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const admin = await AdminModel.findById(
      req.session.adminId
    ).select("email role");

    if (!admin) {
      req.session.destroy(() => {});
      res.status(401).json({
        success: false,
        message: "Administrator session is no longer valid.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
