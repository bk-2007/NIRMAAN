import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RoomRepository, TeamRepository, EvaluationRepository, RequestRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const totalRooms = await RoomRepository.countRooms();
    const totalTeams = await TeamRepository.countTeams();
    const totalEvaluated = await EvaluationRepository.countEvaluations();
    const pendingEvaluations = Math.max(0, totalTeams - totalEvaluated);
    const pendingRequests = await RequestRepository.countRequests({ status: "PENDING" });
    const approvedRequests = await RequestRepository.countRequests({ status: "APPROVED" });

    // Qualified teams (Top 2 per room + approved extra requests)
    const qualifiedTeamsCount = Math.min(totalTeams, totalRooms * 2 + approvedRequests);

    const rooms = await RoomRepository.findRooms({});
    const roomMetrics = rooms.map((r) => ({
      roomName: r.name,
      roomNumber: r.roomNumber,
      teams: r.teamsCount,
      evaluated: r.evaluationsCount,
      completion: r.teamsCount > 0 ? Math.round((r.evaluationsCount / r.teamsCount) * 100) : 0,
    }));

    // Calculate average score breakdown
    const evaluations = await EvaluationRepository.getEvaluations({});
    let avgInnovation = 0;
    let avgTech = 0;
    let avgPresentation = 0;
    let avgFeasibility = 0;
    let avgImpact = 0;
    let avgTotal = 0;

    if (evaluations.length > 0) {
      const sum = evaluations.reduce(
        (acc, curr) => ({
          inn: acc.inn + curr.innovation,
          tech: acc.tech + curr.technicalExcellence,
          pres: acc.pres + curr.presentation,
          feas: acc.feas + curr.feasibility,
          imp: acc.imp + curr.impact,
          tot: acc.tot + curr.totalScore,
        }),
        { inn: 0, tech: 0, pres: 0, feas: 0, imp: 0, tot: 0 }
      );

      const len = evaluations.length;
      avgInnovation = Number((sum.inn / len).toFixed(1));
      avgTech = Number((sum.tech / len).toFixed(1));
      avgPresentation = Number((sum.pres / len).toFixed(1));
      avgFeasibility = Number((sum.feas / len).toFixed(1));
      avgImpact = Number((sum.imp / len).toFixed(1));
      avgTotal = Number((sum.tot / len).toFixed(1));
    }

    return NextResponse.json({
      stats: {
        totalRooms,
        totalTeams,
        totalEvaluated,
        pendingEvaluations,
        pendingRequests,
        qualifiedTeamsCount,
        overallCompletionPercentage:
          totalTeams > 0 ? Math.round((totalEvaluated / totalTeams) * 100) : 0,
      },
      roomMetrics,
      averages: {
        innovation: avgInnovation,
        technicalExcellence: avgTech,
        presentation: avgPresentation,
        feasibility: avgFeasibility,
        impact: avgImpact,
        total: avgTotal,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
