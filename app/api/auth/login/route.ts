import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";
import { comparePassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limitResult = await rateLimit(ip, 10, 60 * 1000); // 10 attempts per minute
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials input" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    await connectToDatabase();

    let userObj = await UserRepository.getUserByEmail(email);

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
