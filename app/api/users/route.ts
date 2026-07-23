import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";
import { getSession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "JURY", "COORDINATOR"]),
  roomId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();
    const users = await UserRepository.getUsers();

    // Remove passwords before returning
    const safeUsers = users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });

    return NextResponse.json({ users: safeUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid user details" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await UserRepository.getUserByEmail(parsed.data.email);
    if (existing) {
      return NextResponse.json({ error: "User email already exists" }, { status: 400 });
    }

    // Check if jury or coordinator is already assigned to this room
    if (parsed.data.roomId && (parsed.data.role === "JURY" || parsed.data.role === "COORDINATOR")) {
      const existingAssignment = await UserRepository.checkAssignmentExists(
        parsed.data.roomId,
        parsed.data.role
      );

      if (existingAssignment) {
        return NextResponse.json(
          { error: `This room already has an assigned ${parsed.data.role}. Each room can only have 1 ${parsed.data.role}.` },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(parsed.data.password);

    const userObj = await UserRepository.createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      roomId: parsed.data.roomId,
    });

    if (userObj) {
      delete userObj.password;
    }

    return NextResponse.json({ success: true, user: userObj });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}
