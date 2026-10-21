
import type { RequestHandler } from "express";
import { QRCodeModel } from "../models/qrCode.model.ts";
import { ScanEventModel } from "../models/scanEvent.model.ts";
import type { DeviceType } from "../models/scanEvent.model.ts";

function detectDevice(userAgent: string): DeviceType {
  if (/android/i.test(userAgent)) {
    return "android";
  }

  if (/iphone|ipad|ipod/i.test(userAgent)) {
    return "ios";
  }

  return "other";
}

export const redirectQRCode: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { qrId } = req.params;

    if (typeof qrId !== "string" || !/^[a-f0-9]{32}$/i.test(qrId)) {
      res.status(400).send("Invalid QR code ID.");
      return;
    }

    const qrCode = await QRCodeModel.findOne({
      qrId,
      isActive: true,
    });

    if (!qrCode) {
      res.status(404).send("QR code not found or inactive.");
      return;
    }

    const userAgent = (req.get("user-agent") ?? "").slice(0, 500);
    const deviceType = detectDevice(userAgent);

    await ScanEventModel.create({
      qrId: qrCode.qrId,
      qrCodeId: qrCode._id,
      deviceType,
      userAgent,
    });

    if (deviceType === "ios") {
      res.redirect(302, qrCode.iosUrl);
      return;
    }

    if (deviceType === "android") {
      res.redirect(302, qrCode.androidUrl);
      return;
    }

    res.status(200).send(
      "QR code recognized. Please open this link on an iPhone or Android device."
    );
  } catch (error) {
    next(error);
  }
};
