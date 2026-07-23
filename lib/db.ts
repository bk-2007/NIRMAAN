import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nirmaan_db";

let isSeeded = false;

export async function seedAdminUserSupabase() {
  if (isSeeded) return;
  try {
    const adminEmail = "balakrishnagorle2007@gmail.com";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345", salt);

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", adminEmail)
      .maybeSingle();

    if (!existing) {
      await supabase.from("users").insert({
        name: "Balakrishna Gorle",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      });
      console.log(`[Supabase Auto-Seed] Created Admin user: ${adminEmail}`);
    } else {
      await supabase
        .from("users")
        .update({ password: hashedPassword, role: "ADMIN" })
        .eq("email", adminEmail);
      console.log(`[Supabase Auto-Seed] Updated Admin user credentials: ${adminEmail}`);
    }
    isSeeded = true;
  } catch (err) {
    console.error("[Supabase Auto-Seed] Error:", err);
  }
}

export async function connectToDatabase() {
  // If Supabase URL is configured, use Supabase engine
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xyzcompany")) {
    await seedAdminUserSupabase();
    return true;
  }

  // Fallback to Mongoose MongoDB
  try {
    if (mongoose.connection.readyState >= 1) return mongoose;
    await mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 5000 });
    console.log("Connected to MongoDB database successfully.");
    return mongoose;
  } catch (err) {
    console.warn("MongoDB offline, falling back to Supabase/Dynamic store:", err);
    return null;
  }
}
