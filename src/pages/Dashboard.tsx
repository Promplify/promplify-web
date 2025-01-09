import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import CreatePrompt from "./dashboard/CreatePrompt";
import Prompts from "./dashboard/Prompts";
import Settings from "./dashboard/Settings";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to access the dashboard");
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
            <h1 className="text-xl font-semibold text-gray-800">Promplify Dashboard</h1>
          </header>
          
          <main className="flex-1 p-6 bg-gray-50">
            <Routes>
              <Route path="/" element={
                <div className="container mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Welcome to Promplify</h2>
                  <div className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-500">Get started by creating your first prompt.</p>
                  </div>
                </div>
              } />
              <Route path="/create" element={<CreatePrompt />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-200 py-4 px-6">
            <p className="text-center text-sm text-gray-600">
              © {new Date().getFullYear()} Promplify. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}