import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RoomRepository, EvaluationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { isLocked } = await req.json();

    await connectToDatabase();

    const room = await RoomRepository.updateRoomLock(roomId, Boolean(isLocked));

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Update evaluation locks for this room
    await EvaluationRepository.updateManyEvaluationLocks(roomId, Boolean(isLocked));

    emitSocketEvent("room:lock_changed", { roomId, isLocked: Boolean(isLocked) }, roomId);

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update room lock status" }, { status: 500 });
  }
}
