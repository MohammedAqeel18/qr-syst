import { Router } from "express";
import {
  getCurrentAdmin,
  getCsrfToken,
  login,
  logout,
  
} from "../controllers/auth.controller.ts";
import { requireAdmin } from "../middleware/requireAdmin.ts";
import { requireCsrf } from "../middleware/requireCsrf.ts";
import { loginLimiter } from "../middleware/loginLimiter.ts";

const router = Router();

router.post("/login", loginLimiter, login);
router.get("/csrf", requireAdmin, getCsrfToken);
router.post("/logout", requireAdmin, requireCsrf,  logout);
router.get("/me", requireAdmin, getCurrentAdmin);

export default router;