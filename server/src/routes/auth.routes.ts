import { Router } from "express";
import {
  getCurrentAdmin,
  login,
  logout,
} from "../controllers/auth.controller.ts";
import { requireAdmin } from "../middleware/requireAdmin.ts";
import { loginLimiter } from "../middleware/loginLimiter.js";

const router = Router();

router.post("/login", loginLimiter, login);
router.post("/logout", requireAdmin, logout);
router.get("/me", requireAdmin, getCurrentAdmin);

export default router;