
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminModel } from "../models/admin.model.js";

async function resetAdminPassword(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri || !email || !password) {
    throw new Error(
      "MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required."
    );
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  }

  try {
    await mongoose.connect(mongoUri);

    const admin = await AdminModel.findOne({ email });

    if (!admin) {
      throw new Error(
        "Administrator not found in this database. No password was changed."
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await AdminModel.updateOne(
      { _id: admin._id },
      { $set: { passwordHash } }
    );

    console.log("Administrator password hash updated successfully.");
  } finally {
    await mongoose.disconnect();
  }
}

resetAdminPassword().catch((error: unknown) => {
  console.error("Password reset failed:", error);
  process.exitCode = 1;
});
