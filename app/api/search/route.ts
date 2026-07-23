import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { TeamRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json({ teams: [], rooms: [] });
    }

    await connectToDatabase();

    const { teams, rooms } = await TeamRepository.searchTeamsAndRooms(q);

    return NextResponse.json({ teams, rooms });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Search failed" }, { status: 500 });
  }
}
