import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeamRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "COORDINATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { isPresent } = await req.json();

    await connectToDatabase();

    const team = await TeamRepository.getTeamById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamRoomId = team.roomId?._id || team.roomId;

    if (session.role === "COORDINATOR" && session.roomId !== teamRoomId.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTeam = await TeamRepository.updateAttendance(teamId, Boolean(isPresent));

    emitSocketEvent("team:updated", updatedTeam, teamRoomId.toString());

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update attendance" }, { status: 500 });
  }
}
