import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import CreatePrompt from "./dashboard/CreatePrompt";
import Prompts from "./dashboard/Prompts";
import Settings from "./dashboard/Settings";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // if (!session) {
      //   toast.error("Please login to access the dashboard");
      //   navigate("/auth");
      // }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex">
        <SidebarProvider>
          <div className="flex w-full">
            <div className="fixed left-0 top-[68px] bottom-0 z-40">
              <DashboardSidebar />
            </div>
            <div className="flex-1 pl-64">
              <main className="min-h-[calc(100vh-68px-88px)] container mx-auto px-6 py-8">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Welcome to Promplify</h2>
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                          <p className="text-gray-500">Get started by creating your first prompt.</p>
                        </div>
                      </div>
                    }
                  />
                  <Route path="/create" element={<CreatePrompt />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
