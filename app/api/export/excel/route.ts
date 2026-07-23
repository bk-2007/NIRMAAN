import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RoomRepository, TeamRepository, EvaluationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const rooms = await RoomRepository.findRooms({});
    // Sort rooms by room number
    rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));

    const wb = XLSX.utils.book_new();

    for (const room of rooms) {
      const roomIdStr = room._id || room.id;
      const teams = await TeamRepository.getTeams({ roomId: roomIdStr });
      const evaluations = await EvaluationRepository.getEvaluations({ roomId: roomIdStr });

      const evalMap = new Map();
      evaluations.forEach((ev) => {
        const evTeamId = ev.teamId?._id || ev.teamId?.id || ev.teamId;
        evalMap.set(evTeamId.toString(), ev);
      });

      const rows = teams.map((team, idx) => {
        const teamIdStr = team._id ? team._id.toString() : team.id;
        const ev = evalMap.get(teamIdStr);
        return {
          "S.No": idx + 1,
          "Team Name": team.name,
          "College": team.college,
          "Leader": team.leaderName,
          "Problem Statement": team.problemStatement,
          "Innovation (20)": ev ? ev.innovation : "N/A",
          "Tech Excellence (20)": ev ? ev.technicalExcellence : "N/A",
          "Presentation (20)": ev ? ev.presentation : "N/A",
          "Feasibility (20)": ev ? ev.feasibility : "N/A",
          "Impact (20)": ev ? ev.impact : "N/A",
          "Total Score (100)": ev ? ev.totalScore : "Unevaluated",
          "Remarks": ev ? ev.remarks : "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      const sheetName = `Room ${room.roomNumber}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=Nirmaan_Hackathon_Leaderboard.xlsx`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate Excel export" }, { status: 500 });
  }
}
