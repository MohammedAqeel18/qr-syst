import type { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { AdminModel } from "../models/admin.model.ts";


export const login: RequestHandler = async (req, res, next) => {
  const { username, email, password } = req.body ?? {};


  const loginIdentifier =
    typeof username === "string" ? username : email;

  if (
    typeof loginIdentifier !== "string" ||
    typeof password !== "string" ||
    loginIdentifier.trim().length === 0 ||
    loginIdentifier.length > 254 ||
    password.length > 128
  ) {
    res.status(400).json({
      success: false,
      message: "Valid username and password are required.",
    });
    return;
  }

  try {
    const normalizedIdentifier = loginIdentifier.trim().toLowerCase();

    const admin = await AdminModel.findOne({
      username: normalizedIdentifier,
    }).select("+passwordHash");

    const passwordMatches = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password.",
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
            username: admin.username,
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


export const getCurrentAdmin: RequestHandler = async (req, res, next) => {
  try {
    const admin = await AdminModel.findById(req.session.adminId).select(
      "username email role"
    );

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
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};



export const getAdminProfile: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const admin = await AdminModel.findById(req.session.adminId).select(
      "username email role createdAt updatedAt"
    );

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username ?? "",
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};


export const updateAdminProfile: RequestHandler = async (
  req,
  res,
  next
) => {
  const { username, email } = req.body ?? {};

  if (
    typeof username !== "string" ||
    typeof email !== "string"
  ) {
    res.status(400).json({
      success: false,
      message: "Username and email are required.",
    });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  const usernameIsValid = /^[a-z0-9._-]{3,30}$/.test(
    normalizedUsername
  );

  const emailIsValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (!usernameIsValid) {
    res.status(400).json({
      success: false,
      message:
        "Username must be 3–30 characters and contain only letters, numbers, dots, underscores, or hyphens.",
    });
    return;
  }

  if (!emailIsValid || normalizedEmail.length > 254) {
    res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
    return;
  }

  try {
    const admin = await AdminModel.findById(req.session.adminId);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
      return;
    }

    admin.username = normalizedUsername;
    admin.email = normalizedEmail;

    await admin.save();

    res.status(200).json({
      success: true,
      message: "Administrator profile updated successfully.",
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error) {
    const mongoError = error as { code?: number };

    if (mongoError.code === 11000) {
      res.status(409).json({
        success: false,
        message: "That username or email address is already in use.",
      });
      return;
    }

    next(error);
  }
};



export const updateAdminPassword: RequestHandler = async (
  req,
  res,
  next
) => {
  const { currentPassword, newPassword } = req.body ?? {};

  if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    currentPassword.length === 0 ||
    currentPassword.length > 128 ||
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    res.status(400).json({
      success: false,
      message:
        "A valid current password and a new password of at least 8 characters are required.",
    });
    return;
  }

  try {
    const admin = await AdminModel.findById(
      req.session.adminId
    ).select("+passwordHash");

    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Administrator account not found.",
      });
      return;
    }

    const currentPasswordMatches = await bcrypt.compare(
      currentPassword,
      admin.passwordHash
    );

    if (!currentPasswordMatches) {
      res.status(401).json({
        success: false,
        message: "Your current password is incorrect.",
      });
      return;
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      admin.passwordHash
    );

    if (samePassword) {
      res.status(400).json({
        success: false,
        message: "Your new password must be different.",
      });
      return;
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 12);
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};



export const getCsrfToken: RequestHandler = (req, res, next) => {
  req.session.csrfToken = randomBytes(32).toString("hex");

  req.session.save((error) => {
    if (error) {
      next(error);
      return;
    }

    res.status(200).json({
      success: true,
      csrfToken: req.session.csrfToken,
    });
  });
};