import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { RequestRepository, NotificationRepository } from "@/lib/repositories";
import { getSession } from "@/lib/auth";
import { emitSocketEvent } from "@/lib/socket-emitter";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestId } = await params;
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    await connectToDatabase();

    const requestItem = await RequestRepository.getRequestById(requestId);
    if (!requestItem) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updatedRequest = await RequestRepository.updateRequestStatus(requestId, "REJECTED");

    const requestItemRoomId = updatedRequest.roomId?._id || updatedRequest.roomId;
    const requestItemTeam = updatedRequest.teamId;

    const notif = await NotificationRepository.createNotification({
      title: "Request Rejected",
      message: `Admin rejected request for team "${(requestItemTeam as any)?.name || "N/A"}".`,
      type: "REQUEST_REJECTED",
      targetRole: "JURY",
      targetRoomId: requestItemRoomId.toString(),
    });

    emitSocketEvent("request:updated", updatedRequest, requestItemRoomId.toString());
    emitSocketEvent("notification:new", notif);

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reject request" }, { status: 500 });
  }
}
