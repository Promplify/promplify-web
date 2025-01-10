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
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="flex-none">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-none">
          <Sidebar />
        </div>
        <div className="flex-none border-r border-gray-200">
          <PromptList />
        </div>
        <div className="flex-1">
          <PromptEditor />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-none">
        <DashboardFooter />
      </div>
    </div>
  );
}
