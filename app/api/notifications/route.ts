import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const notifications = await NotificationRepository.getNotifications(
      session.role,
      session.roomId
    );

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}
