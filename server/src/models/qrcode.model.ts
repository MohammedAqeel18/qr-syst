
import { randomBytes } from "node:crypto";
import mongoose, { Schema, type Model } from "mongoose";

export interface QRCode {
  name: string;
  qrId: string;
  iosUrl: string;
  androidUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function isValidStoreUrl(value: string, allowedHost: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === allowedHost
    );
  } catch {
    return false;
  }
}

const qrCodeSchema = new Schema<QRCode>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    qrId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      default: () => randomBytes(16).toString("hex"),
    },

    iosUrl: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) =>
          isValidStoreUrl(value, "apps.apple.com"),
        message: "A valid Apple App Store URL is required.",
      },
    },

    androidUrl: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) =>
          isValidStoreUrl(value, "play.google.com"),
        message: "A valid Google Play Store URL is required.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QRCodeModel: Model<QRCode> =
  (mongoose.models.QRCode as Model<QRCode> | undefined) ??
  mongoose.model<QRCode>("QRCode", qrCodeSchema);
