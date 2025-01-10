import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PromptEditor } from "@/components/dashboard/PromptEditor";
import { PromptList } from "@/components/dashboard/PromptList";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to access the dashboard");
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-10">
        <DashboardHeader />
      </div>

      {/* Main Content with top padding for header */}
      <div className="flex flex-1 pt-16 pb-12">
        <Sidebar />
        <PromptList />
        <PromptEditor />
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        <DashboardFooter />
      </div>
    </div>
  );
}
