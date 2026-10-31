
import type { RequestHandler } from "express";
import { QRCodeModel } from "../models/qrcode.model.ts";
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



export const deleteQRCode: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { qrId } = req.params;

    if (!qrId || typeof qrId !== "string") {
      res.status(400).json({
        success: false,
        message: "A valid QR code ID is required.",
      });
      return;
    }

    const deletedQRCode = await QRCodeModel.findOneAndDelete({
      qrId,
    });

    if (!deletedQRCode) {
      res.status(404).json({
        success: false,
        message: "QR code not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "QR code deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
