import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeamRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "COORDINATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    await connectToDatabase();

    const existingTeam = await TeamRepository.getTeamById(teamId);
    if (!existingTeam) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const existingTeamRoomId = existingTeam.roomId?._id || existingTeam.roomId;

    if (session.role === "COORDINATOR" && session.roomId !== existingTeamRoomId.toString()) {
      return NextResponse.json({ error: "Forbidden: You can only edit teams in your room" }, { status: 403 });
    }

    const updatedTeam = await TeamRepository.updateTeam(teamId, body);

    emitSocketEvent("team:updated", updatedTeam, existingTeamRoomId.toString());

    return NextResponse.json({ success: true, team: updatedTeam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "COORDINATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDatabase();

    const team = await TeamRepository.getTeamById(teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamRoomId = team.roomId?._id || team.roomId;

    if (session.role === "COORDINATOR" && session.roomId !== teamRoomId.toString()) {
      return NextResponse.json({ error: "Forbidden: You can only delete teams in your room" }, { status: 403 });
    }

    const roomId = teamRoomId.toString();

    await TeamRepository.deleteTeam(teamId);

    emitSocketEvent("team:deleted", { teamId }, roomId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete team" }, { status: 500 });
  }
}
