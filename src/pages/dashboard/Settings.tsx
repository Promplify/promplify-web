import { ApiTokenManager } from "@/components/ApiTokenManager";
import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2C106A] mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto p-6">
        <SEO
          canonicalPath="/settings"
          title="Settings - Promplify"
          description="Manage your API tokens and account settings in Promplify."
          keywords="Promplify settings, API token management, prompt API access"
          robots="noindex, nofollow"
        />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ApiTokenManager />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
