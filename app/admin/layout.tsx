import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/AdminSidebar";
import FuturisticBackground from "@/components/ui/FuturisticBackground";
import CursorFollower from "@/components/ui/CursorFollower";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
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

      <div className="relative z-10 flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
