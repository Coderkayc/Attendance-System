import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import User from "../src/models/User.js";

async function run() {
  const { MONGO_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!MONGO_URI) throw new Error("MONGO_URI missing in .env");
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env");
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("Admin already exists:", exists.email, "role:", exists.role);
    process.exit(0);
  }

  const admin = await User.create({
    name: ADMIN_NAME.trim(),
    email,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  console.log("Admin created:", admin.email, "id:", admin._id.toString());
  process.exit(0);
}

run().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
})