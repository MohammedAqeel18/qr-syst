
import mongoose, { Schema, type Model } from "mongoose";

export interface Admin {
  email: string;
  passwordHash: string;
  role: "admin";
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<Admin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminModel: Model<Admin> =
  (mongoose.models.Admin as Model<Admin> | undefined) ??
  mongoose.model<Admin>("Admin", adminSchema);
