import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
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
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="flex-1 container mx-auto px-4">
        <SidebarProvider>
          <div className="flex gap-6 relative pt-24">
            <DashboardSidebar />
            <div className="flex-1 min-w-0">
              <main className="py-6">
                <Routes>
                  <Route path="/" element={
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold">Welcome to Promplify</h2>
                      <div className="bg-white rounded-lg shadow-sm border p-6">
                        <p className="text-gray-500">Get started by creating your first prompt.</p>
                      </div>
                    </div>
                  } />
                  <Route path="/create" element={<CreatePrompt />} />
                  <Route path="/prompts" element={<Prompts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>

      <Footer />
    </div>
  );
}