import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    try {
      await connectToDatabase();
    } catch {
      console.warn("Database connection unavailable, using local authentication engine.");
    }

    let userObj = await UserRepository.getUserByEmail(email);

    // Admin fallback matching requested admin credentials
    if (!userObj && email === "balakrishnagorle2007@gmail.com" && password === "12345") {
      userObj = {
        _id: "super_admin_balakrishna",
        id: "super_admin_balakrishna",
        name: "Balakrishna Gorle",
        email: "balakrishnagorle2007@gmail.com",
        role: "ADMIN",
      };
    }

    if (!userObj) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Compare password if user has hashed password field
    if (userObj.password) {
      const isMatch = await comparePassword(password, userObj.password);
      if (!isMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      }
    }

    const userId = userObj._id ? userObj._id.toString() : userObj.id;
    const roomId = userObj.roomId ? (typeof userObj.roomId === "object" ? userObj.roomId._id || userObj.roomId.id : userObj.roomId) : undefined;

    const payload = {
      userId,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      roomId,
    };

    await setSessionCookie(payload);

    return NextResponse.json({
      success: true,
      user: {
        _id: userId,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        roomId: userObj.roomId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Login processing failed" }, { status: 500 });
  }
}
