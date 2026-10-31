
import { Router } from "express";
import {
  createQRCode,
  getQRCodes,
  deleteQRCode,
} from "../controllers/qr.controller.js";

const router = Router();

router.post("/", createQRCode);
router.get("/", getQRCodes);
router.delete("/:qrId" , deleteQRCode);


export default router;
