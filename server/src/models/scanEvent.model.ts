
import mongoose, { Schema, type Model } from "mongoose";

export type DeviceType = "ios" | "android" | "other";

export interface ScanEvent {
  qrId: string;
  qrCodeId: mongoose.Types.ObjectId;
  deviceType: DeviceType;
  userAgent: string;
  createdAt: Date;
  updatedAt: Date;
}

const scanEventSchema = new Schema<ScanEvent>(
  {
    qrId: {
      type: String,
      required: true,
      index: true,
    },
    qrCodeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "QRCode",
      index: true,
    },
    deviceType: {
      type: String,
      enum: ["ios", "android", "other"],
      required: true,
    },
    userAgent: {
      type: String,
      maxlength: 500,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const ScanEventModel: Model<ScanEvent> =
  (mongoose.models.ScanEvent as Model<ScanEvent> | undefined) ??
  mongoose.model<ScanEvent>("ScanEvent", scanEventSchema);
