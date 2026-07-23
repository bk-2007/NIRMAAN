import mongoose from "mongoose";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/nirmaan_db";

export async function connectToDatabase() {
  // If Supabase URL is configured, use Supabase engine
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("xyzcompany")) {
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
