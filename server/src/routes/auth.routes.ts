import { Router } from "express";

import {
  getAdminProfile,
  getCurrentAdmin,
  getCsrfToken,
  login,
  logout,
  updateAdminPassword,
  updateAdminProfile,
} from "../controllers/auth.controller.ts";

import { requireAdmin } from "../middleware/requireAdmin.ts";
import { requireCsrf } from "../middleware/requireCsrf.ts";
import { loginLimiter } from "../middleware/loginLimiter.ts";

const router = Router();


router.post("/login", loginLimiter, login);
router.post("/logout", requireAdmin, requireCsrf, logout);
router.get("/me", requireAdmin, getCurrentAdmin);


router.get("/csrf", requireAdmin, getCsrfToken);

router.get("/profile", requireAdmin, getAdminProfile);
router.patch(
  "/profile",
  requireAdmin,
  requireCsrf,
  updateAdminProfile
);

router.patch(
  "/password",
  requireAdmin,
  requireCsrf,
  updateAdminPassword
);

export default router;