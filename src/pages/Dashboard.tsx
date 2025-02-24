import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PromptEditor } from "@/components/dashboard/PromptEditor";
import { PromptList } from "@/components/dashboard/PromptList";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    updateMeta("Dashboard", "Manage and optimize your AI prompts with Promplify's intuitive dashboard.", "AI prompt management, prompt organization, prompt optimization, AI workflow");
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  // Handle prompt selection from template page
  useEffect(() => {
    if (location.state?.selectedPromptId && location.state?.source === "template") {
      setSelectedPromptId(location.state.selectedPromptId);
      // Clear the state to prevent reselection on page refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNewPrompt = () => {
    setSelectedPromptId("new");
  };

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <SEO canonicalPath="/dashboard" />
      {/* Fixed Header */}
      <div className="flex-none">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar onCategorySelect={setSelectedCategoryId} selectedCategoryId={selectedCategoryId} />
        <div className="flex-1 flex">
          <div className="w-[320px] border-r border-gray-200">
            <PromptList categoryId={selectedCategoryId} onPromptSelect={handlePromptSelect} selectedPromptId={selectedPromptId} />
          </div>
          <div className="flex-1">
            <PromptEditor promptId={selectedPromptId} onSave={() => setSelectedPromptId(null)} />
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-none">
        <DashboardFooter />
      </div>
    </div>
  );
}
