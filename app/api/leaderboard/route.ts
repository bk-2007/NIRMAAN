import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RoomRepository, TeamRepository, EvaluationRepository, RequestRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    await connectToDatabase();

    let roomsToFetch = [];
    if (roomId) {
      const r = await RoomRepository.getRoomById(roomId);
      if (r) roomsToFetch.push(r);
    } else {
      if (session.role === "JURY" || session.role === "COORDINATOR") {
        if (session.roomId) {
          const r = await RoomRepository.getRoomById(session.roomId);
          if (r) roomsToFetch.push(r);
        }
      } else {
        // Fetch all rooms
        const allRooms = await RoomRepository.findRooms({});
        // Sort by roomNumber ascending as requested
        allRooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
        roomsToFetch = allRooms;
      }
    }

    const leaderboards = await Promise.all(
      roomsToFetch.map(async (room) => {
        const room_id_str = room._id || room.id;
        const teams = await TeamRepository.getTeams({ roomId: room_id_str });
        const evaluations = await EvaluationRepository.getEvaluations({ roomId: room_id_str });
        const approvedRequests = await RequestRepository.getRequests({
          roomId: room_id_str,
          status: "APPROVED",
        });

        const approvedTeamIds = new Set(
          approvedRequests.map((reqItem) => {
            const reqTeamId = reqItem.teamId?._id || reqItem.teamId?.id || reqItem.teamId;
            return reqTeamId.toString();
          })
        );

        const evalMap = new Map();
        evaluations.forEach((e) => {
          const evTeamId = e.teamId?._id || e.teamId?.id || e.teamId;
          evalMap.set(evTeamId.toString(), e);
        });

        // Combine team + evaluation
        const items = teams.map((team) => {
          const teamIdStr = team._id ? team._id.toString() : team.id;
          const ev = evalMap.get(teamIdStr);
          const totalScore = ev ? ev.totalScore : 0;
          return {
            team,
            evaluation: ev || null,
            totalScore,
            isApprovedExtra: approvedTeamIds.has(teamIdStr),
          };
        });

        // Sort descending by score
        items.sort((a, b) => b.totalScore - a.totalScore);

        // Assign ranks and top 2 badges
        const rankedItems = items.map((item, index) => ({
          ...item,
          rank: index + 1,
          isTop2: index < 2 && item.totalScore > 0,
        }));

        const totalTeams = teams.length;
        const evaluatedCount = items.filter((i) => i.evaluation !== null).length;
        const completionPercentage =
          totalTeams > 0 ? Math.round((evaluatedCount / totalTeams) * 100) : 0;

        return {
          room,
          totalTeams,
          evaluatedCount,
          completionPercentage,
          leaderboard: rankedItems,
        };
      })
    );

    return NextResponse.json({ leaderboards });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate leaderboard" }, { status: 500 });
  }
}
