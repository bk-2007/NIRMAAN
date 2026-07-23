import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { UserRepository } from "@/lib/repositories";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user: any = null;
    try {
      await connectToDatabase();
      user = await UserRepository.getUserById(session.userId);
      if (user) {
        delete user.password;
      }
    } catch {}

    if (!user) {
      user = {
        _id: session.userId,
        name: session.name,
        email: session.email,
        role: session.role,
        roomId: session.roomId,
      };
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch session" }, { status: 500 });
  }
}
