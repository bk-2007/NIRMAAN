import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RoomRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";
import { z } from "zod";

const createRoomSchema = z.object({
  name: z.string().min(2),
  roomNumber: z.string().min(1),
  description: z.string().optional(),
  capacity: z.number().min(1).default(20),
});

export async function GET() {
  try {
    const session = await getSession();
    await connectToDatabase();

    // If anonymous, return all rooms (for registration dropdown)
    if (!session) {
      const allRooms = await RoomRepository.findRooms({});
      return NextResponse.json({ rooms: allRooms });
    }

    // If Jury or Coordinator, return only assigned room
    let filter: any = {};
    if (session.role === "JURY" || session.role === "COORDINATOR") {
      if (!session.roomId) {
        return NextResponse.json({ rooms: [] });
      }
      filter._id = session.roomId;
    }

    const enrichedRooms = await RoomRepository.findRooms(filter);

    return NextResponse.json({ rooms: enrichedRooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createRoomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid room payload" }, { status: 400 });
    }

    await connectToDatabase();

    const existing = await RoomRepository.getRoomByNumber(parsed.data.roomNumber);
    if (existing) {
      return NextResponse.json({ error: "Room number already exists" }, { status: 400 });
    }

    const room = await RoomRepository.createRoom({
      name: parsed.data.name,
      roomNumber: parsed.data.roomNumber,
      description: parsed.data.description || "",
      capacity: parsed.data.capacity,
    });

    emitSocketEvent("room:created", room);

    return NextResponse.json({ success: true, room });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create room" }, { status: 500 });
  }
}
