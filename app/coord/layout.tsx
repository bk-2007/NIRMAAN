import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import FuturisticBackground from "@/components/ui/FuturisticBackground";
import CursorFollower from "@/components/ui/CursorFollower";

export default async function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "COORDINATOR") {
    redirect("/login");
  }

  const user = {
    _id: session.userId,
    name: session.name,
    email: session.email,
    role: session.role,
    roomId: session.roomId,
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0F172A]">
      <FuturisticBackground />
      <CursorFollower />

      <Navbar user={user} />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
