
import { Router } from "express";
import {
  createQRCode,
  getQRCodes,
} from "../controllers/qr.controller.js";

const router = Router();

router.post("/", createQRCode);
router.get("/", getQRCodes);

export default router;
