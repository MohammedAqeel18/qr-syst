
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminModel } from "../models/admin.model.ts";

async function createAdmin(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri || !email || !password) {
    throw new Error(
      "MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD are required."
    );
  }

  if (password.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  await mongoose.connect(mongoUri);

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const existingAdmin = await AdminModel.findOne({
      email: normalizedEmail,
    });

    if (existingAdmin) {
      console.log("Administrator already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await AdminModel.create({
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });

    console.log("Administrator created successfully.");
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error: unknown) => {
  console.error("Could not create administrator:", error);
  process.exitCode = 1;
});
