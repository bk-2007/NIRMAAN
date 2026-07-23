import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeamRepository, NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";
import { z } from "zod";

const createTeamSchema = z.object({
  name: z.string().min(2),
  college: z.string().min(2),
  leaderName: z.string().min(2),
  members: z.array(z.string()).default([]),
  problemStatement: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email(),
  submissionLink: z.string().optional(),
  roomId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    await connectToDatabase();

    let query: any = {};
    if (roomId) {
      query.roomId = roomId;
    } else if (session.role === "JURY" || session.role === "COORDINATOR") {
      if (!session.roomId) return NextResponse.json({ teams: [] });
      query.roomId = session.roomId;
    }

    const teams = await TeamRepository.getTeams(query);

    return NextResponse.json({ teams });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch teams" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "COORDINATOR")) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Coordinator access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid team details", details: parsed.error.format() }, { status: 400 });
    }

    // Room restriction enforcement for Coordinator
    if (session.role === "COORDINATOR" && session.roomId !== parsed.data.roomId) {
      return NextResponse.json(
        { error: "Forbidden: Coordinator can only add teams to their assigned room." },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const populatedTeam = await TeamRepository.createTeam({
      name: parsed.data.name,
      college: parsed.data.college,
      leaderName: parsed.data.leaderName,
      members: parsed.data.members,
      problemStatement: parsed.data.problemStatement,
      phone: parsed.data.phone,
      email: parsed.data.email,
      submissionLink: parsed.data.submissionLink || "",
      roomId: parsed.data.roomId,
    });

    // Create Notification
    const notif = await NotificationRepository.createNotification({
      title: "New Team Registered",
      message: `Team "${populatedTeam.name}" (${populatedTeam.college}) has been registered by Coordinator.`,
      type: "TEAM_ADDED",
      targetRole: "ALL",
      targetRoomId: populatedTeam.roomId?._id || populatedTeam.roomId,
    });

    // Realtime Socket Emission
    emitSocketEvent("team:added", populatedTeam, parsed.data.roomId);
    emitSocketEvent("notification:new", notif);

    return NextResponse.json({ success: true, team: populatedTeam });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create team" }, { status: 500 });
  }
}
