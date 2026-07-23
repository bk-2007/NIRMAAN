import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RequestRepository, TeamRepository, NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";
import { z } from "zod";

const createRequestSchema = z.object({
  teamId: z.string().min(1),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let query: any = {};
    if (session.role === "JURY") {
      if (!session.roomId) return NextResponse.json({ requests: [] });
      query.roomId = session.roomId;
    }

    const requests = await RequestRepository.getRequests(query);

    return NextResponse.json({ requests });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "JURY") {
      return NextResponse.json({ error: "Forbidden: Jury access required" }, { status: 403 });
    }

    if (!session.roomId) {
      return NextResponse.json({ error: "Jury is not assigned to any room" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Reason is required (min 5 characters)" }, { status: 400 });
    }

    await connectToDatabase();

    const team = await TeamRepository.getTeamById(parsed.data.teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamRoomId = team.roomId?._id || team.roomId;

    if (teamRoomId.toString() !== session.roomId) {
      return NextResponse.json(
        { error: "Forbidden: Request can only be made for teams in your assigned room" },
        { status: 403 }
      );
    }

    const teamIdStr = team._id ? team._id.toString() : team.id;

    // Check if request already exists for this team
    const existingReq = await RequestRepository.checkRequestExists(
      session.roomId,
      teamIdStr
    );

    if (existingReq) {
      return NextResponse.json(
        { error: `Request for team "${team.name}" already submitted with status: ${existingReq.status}` },
        { status: 400 }
      );
    }

    const populatedReq = await RequestRepository.createRequest({
      roomId: session.roomId,
      juryId: session.userId,
      teamId: teamIdStr,
      reason: parsed.data.reason,
    });

    const notif = await NotificationRepository.createNotification({
      title: "Additional Selection Request",
      message: `Jury requested extra team "${team.name}". Reason: ${parsed.data.reason}`,
      type: "REQUEST_CREATED",
      targetRole: "ADMIN",
      targetRoomId: teamRoomId.toString(),
    });

    emitSocketEvent("request:created", populatedReq, session.roomId);
    emitSocketEvent("notification:new", notif);

    return NextResponse.json({ success: true, request: populatedReq });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 });
  }
}
