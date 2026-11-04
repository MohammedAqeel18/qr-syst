
import { Router } from "express";
import { getAnalyticsSummary,getQRCodeAnalytics, exportAnalyticsCSV } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/export", exportAnalyticsCSV);

router.get("/qr/:qrId", getQRCodeAnalytics);

router.get("/summary", getAnalyticsSummary);



export default router;
