// Socket.io broadcaster helper for Next.js API Routes and Server Actions

export function emitSocketEvent(event: string, data: any, roomId?: string) {
  try {
    const io = (global as any).io;
    if (io) {
      if (roomId) {
        io.to(`room:${roomId}`).emit(event, data);
        io.emit(event, data); // Also emit globally to admin
      } else {
        io.emit(event, data);
      }
    }
  } catch (err) {
    console.error("Socket emission error:", err);
  }
}
