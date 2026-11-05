
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { AdminModel } from "../models/admin.model.ts";

async function createAdmin(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri || !username || !email || !password) {
    throw new Error(
      "MONGODB_URI, ADMIN_USERNAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required."
    );
  }

  const normalizedUsername = username.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();

  if (!/^[a-z0-9._-]{3,30}$/.test(normalizedUsername)) {
    throw new Error("Username must be 3–30 valid characters.");
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error(
      "Admin password must be between 12 and 128 characters."
    );
  }

  await mongoose.connect(mongoUri);

  try {
    const existingAdmin = await AdminModel.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingAdmin) {
      console.log(
        "An administrator with this username or email already exists."
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await AdminModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      role: "admin",
    });

    console.log("Administrator created successfully.");
    console.log(`Username: ${normalizedUsername}`);
    console.log(`Email: ${normalizedEmail}`);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin().catch((error: unknown) => {
  console.error("Could not create administrator:", error);
  process.exitCode = 1;
});
