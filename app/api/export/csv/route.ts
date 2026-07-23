import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeamRepository, EvaluationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const teams = await TeamRepository.getTeams({});
    const evaluations = await EvaluationRepository.getEvaluations({});

    const evalMap = new Map();
    evaluations.forEach((ev) => {
      const evTeamId = ev.teamId?._id || ev.teamId?.id || ev.teamId;
      evalMap.set(evTeamId.toString(), ev);
    });

    let csvContent = "Room,Team Name,College,Leader,Problem Statement,Innovation,Tech Excellence,Presentation,Feasibility,Impact,Total Score,Remarks\n";

    teams.forEach((t) => {
      const teamIdStr = t._id ? t._id.toString() : t.id;
      const ev = evalMap.get(teamIdStr);
      const roomName = t.roomId?.name || "N/A";
      const line = [
        `"${roomName}"`,
        `"${t.name}"`,
        `"${t.college}"`,
        `"${t.leaderName}"`,
        `"${t.problemStatement.replace(/"/g, '""')}"`,
        ev ? ev.innovation : 0,
        ev ? ev.technicalExcellence : 0,
        ev ? ev.presentation : 0,
        ev ? ev.feasibility : 0,
        ev ? ev.impact : 0,
        ev ? ev.totalScore : 0,
        `"${ev ? (ev.remarks || "").replace(/"/g, '""') : ""}"`,
      ].join(",");
      csvContent += line + "\n";
    });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=Nirmaan_Evaluation_Data.csv`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate CSV export" }, { status: 500 });
  }
}
