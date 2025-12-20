import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 h-screen">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}