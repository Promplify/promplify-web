import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PromptEditor } from "@/components/dashboard/PromptEditor";
import { PromptList } from "@/components/dashboard/PromptList";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showMobilePromptList, setShowMobilePromptList] = useState(false);

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
    // Close mobile prompt list when selecting a prompt
    setShowMobilePromptList(false);
  };

  const handlePromptSave = (savedPromptId?: string) => {
    // Trigger PromptList refresh
    setRefreshTrigger((prev) => prev + 1);

    // If a new prompt was created, select it; otherwise maintain current selection
    if (savedPromptId) {
      setSelectedPromptId(savedPromptId);
    } else if (selectedPromptId === "new") {
      // If no ID returned but currently in new state, clear selection
      setSelectedPromptId(null);
    }
  };

  const handlePromptDelete = () => {
    // Trigger PromptList refresh
    setRefreshTrigger((prev) => prev + 1);
    // Clear current selected prompt, let PromptList auto-select first one
    setSelectedPromptId(null);
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <SEO
        canonicalPath="/dashboard"
        title="Dashboard - Promplify"
        description="Manage and optimize your AI prompts with Promplify's intuitive dashboard."
        keywords="AI prompt management, prompt organization, prompt optimization, AI workflow"
      />
      <meta name="robots" content="noindex, nofollow" />
      {/* Fixed Header */}
      <div className="flex-none">
        <DashboardHeader />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setShowMobilePromptList(!showMobilePromptList)}
          className="md:hidden fixed bottom-4 right-4 z-50 bg-[#2C106A] text-white p-3 rounded-full shadow-lg hover:bg-[#1F0B4C] transition-colors"
          aria-label="Toggle prompt list"
        >
          {showMobilePromptList ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Overlay */}
        {showMobilePromptList && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowMobilePromptList(false)}
          />
        )}

        {/* Prompt List - Desktop: sidebar, Mobile: drawer */}
        <div
          className={`
            ${showMobilePromptList ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            fixed md:relative
            inset-y-0 left-0
            z-40 md:z-0
            w-[280px] sm:w-[320px]
            border-r border-gray-200
            transition-transform duration-300 ease-in-out
            bg-white
          `}
        >
          <PromptList
            categoryId={selectedCategoryId}
            onCategorySelect={setSelectedCategoryId}
            onPromptSelect={handlePromptSelect}
            selectedPromptId={selectedPromptId}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Prompt Editor */}
        <div className="flex-1 overflow-hidden">
          <PromptEditor promptId={selectedPromptId} onSave={handlePromptSave} onDelete={handlePromptDelete} />
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex-none">
        <DashboardFooter />
      </div>
    </div>
  );
}
