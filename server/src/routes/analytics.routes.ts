
import { Router } from "express";
import { getAnalyticsSummary } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/summary", getAnalyticsSummary);

export default router;
