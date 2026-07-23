import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notifId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    await NotificationRepository.markAsRead(notifId, session.userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to mark read" }, { status: 500 });
  }
}
