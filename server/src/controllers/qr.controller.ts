
import type { RequestHandler } from "express";
import { QRCodeModel } from "../models/qrCode.model.ts";
import { createQRCodeSchema } from "../validators/qr.validator.js";

export const createQRCode: RequestHandler = async (
  req,
  res,
  next
) => {
  const result = createQRCodeSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const qrCode = await QRCodeModel.create(result.data);

    res.status(201).json({
      success: true,
      message: "QR code created successfully",
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const getQRCodes: RequestHandler = async (
  _req,
  res,
  next
) => {
  try {
    const qrCodes = await QRCodeModel.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes,
    });
  } catch (error) {
    next(error);
  }
};
