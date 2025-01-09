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
      <div className="flex-1 bg-gray-50">
        <SidebarProvider>
          <div className="container mx-auto px-4 relative">
            <div className="flex pt-[68px]">
              <DashboardSidebar />
              <main className="flex-1 flex flex-col md:pl-64">
                <div className="flex-1 py-8">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome to Promplify</h2>
                          </div>
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
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
      <Footer />
    </div>
  );
}
