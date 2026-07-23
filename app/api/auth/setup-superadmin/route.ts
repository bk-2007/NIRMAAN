import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";

const setupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(5),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limitResult = await rateLimit(ip, 5, 60 * 1000); // 5 attempts per minute
    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((limitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    await connectToDatabase();

    const userCount = await UserRepository.countUsers();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Super Admin setup is closed because users already exist." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid registration input" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const admin = await UserRepository.createUser({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Initial Super Admin created successfully. You can now login.",
      user: {
        _id: admin._id || admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create super admin" }, { status: 500 });
  }
}
