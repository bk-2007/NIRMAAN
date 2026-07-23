import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(5),
  role: z.enum(["JURY", "COORDINATOR"]),
  roomId: z.string().min(1, "Room assignment is required"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limitResult = await rateLimit(ip, 5, 60 * 1000); // 5 attempts per minute
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid registration input";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    await connectToDatabase();

    const email = parsed.data.email.toLowerCase();

    const existing = await UserRepository.getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "User email already registered" }, { status: 400 });
    }

    // Check if jury or coordinator is already assigned to this room
    if (parsed.data.roomId) {
      const existingAssignment = await UserRepository.checkAssignmentExists(
        parsed.data.roomId,
        parsed.data.role
      );

      if (existingAssignment) {
        return NextResponse.json(
          { error: `This room already has an assigned ${parsed.data.role}. Each room can only have 1.` },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const userObj = await UserRepository.createUser({
      name: parsed.data.name,
      email,
      password: hashedPassword,
      role: parsed.data.role,
      roomId: parsed.data.roomId,
    });

    const userId = userObj._id ? userObj._id.toString() : userObj.id;

    const payload = {
      userId,
      name: userObj.name,
      email: userObj.email,
      role: userObj.role,
      roomId: userObj.roomId,
    };

    // Auto-login newly registered user
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
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}
