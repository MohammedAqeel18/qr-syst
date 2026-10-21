
import { Router } from "express";
import { redirectQRCode } from "../controllers/redirect.controller.js";

const router = Router();

router.get("/:qrId", redirectQRCode);

export default router;
