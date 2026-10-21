
import { Router } from "express";
import { getAnalyticsSummary,getQRCodeAnalytics } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/qr/:qrId", getQRCodeAnalytics);
router.get("/summary", getAnalyticsSummary);

export default router;
