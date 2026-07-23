import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { EvaluationRepository, TeamRepository, RoomRepository, NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";
import { z } from "zod";

const evaluationSchema = z.object({
  teamId: z.string().min(1),
  innovation: z.number().min(0).max(20),
  technicalExcellence: z.number().min(0).max(20),
  presentation: z.number().min(0).max(20),
  feasibility: z.number().min(0).max(20),
  impact: z.number().min(0).max(20),
  remarks: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    const teamId = searchParams.get("teamId");

    await connectToDatabase();

    let query: any = {};
    if (teamId) {
      query.teamId = teamId;
    } else if (roomId) {
      query.roomId = roomId;
    } else if (session.role === "JURY") {
      if (!session.roomId) return NextResponse.json({ evaluations: [] });
      query.roomId = session.roomId;
    }

    const evaluations = await EvaluationRepository.getEvaluations(query);

    return NextResponse.json({ evaluations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch evaluations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "JURY")) {
      return NextResponse.json(
        { error: "Forbidden: Admin or Jury access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = evaluationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid evaluation payload. All 5 criteria must be 0-20." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const team = await TeamRepository.getTeamById(parsed.data.teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const teamRoomId = team.roomId?._id || team.roomId;

    // Enforce Jury assigned room restrictions
    if (session.role === "JURY") {
      if (!session.roomId || session.roomId !== teamRoomId.toString()) {
        return NextResponse.json(
          { error: "Forbidden: Jury can ONLY evaluate teams in their assigned room." },
          { status: 403 }
        );
      }
    }

    // Check if room or evaluation is locked
    const room = await RoomRepository.getRoomById(teamRoomId.toString());
    if (room && room.isLocked && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Evaluations for this room are locked by Admin." },
        { status: 403 }
      );
    }

    // Check existing evaluation
    const teamIdStr = team._id ? team._id.toString() : team.id;
    const existingEval = await EvaluationRepository.getEvaluationByTeamId(teamIdStr);
    if (existingEval && existingEval.isLocked && session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Evaluation has already been submitted and locked." },
        { status: 403 }
      );
    }

    const totalScore =
      parsed.data.innovation +
      parsed.data.technicalExcellence +
      parsed.data.presentation +
      parsed.data.feasibility +
      parsed.data.impact;

    const populatedEval = await EvaluationRepository.saveEvaluation({
      teamId: teamIdStr,
      roomId: teamRoomId.toString(),
      juryId: session.userId,
      innovation: parsed.data.innovation,
      technicalExcellence: parsed.data.technicalExcellence,
      presentation: parsed.data.presentation,
      feasibility: parsed.data.feasibility,
      impact: parsed.data.impact,
      remarks: parsed.data.remarks || "",
    });

    // Notification for Admin
    const notif = await NotificationRepository.createNotification({
      title: "Evaluation Submitted",
      message: `Jury evaluated "${team.name}" with score ${totalScore}/100.`,
      type: "EVALUATION_SUBMITTED",
      targetRole: "ADMIN",
      targetRoomId: teamRoomId.toString(),
    });

    // Realtime Socket updates
    emitSocketEvent("evaluation:submitted", populatedEval, teamRoomId.toString());
    emitSocketEvent("notification:new", notif);

    return NextResponse.json({ success: true, evaluation: populatedEval });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit evaluation" }, { status: 500 });
  }
}
