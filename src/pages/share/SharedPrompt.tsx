"use client";

import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { Copy, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

export default function SharedPromptPage() {
  const { token } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promptData, setPromptData] = useState<any>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log("Loading shared prompt with token:", token);

        // 1. Get the share record first
        const { data: shareRecord, error: shareError } = await supabase.from("prompt_shares").select("*").eq("share_token", token).single();

        if (shareError) {
          console.error("Error fetching share record:", shareError);
          setError(shareError.message || "Share not found");
          return;
        }

        if (!shareRecord) {
          console.error("No share record found for token:", token);
          setError("Share not found");
          return;
        }

        console.log("Found share record:", shareRecord);
        setViewCount(shareRecord.views || 0);

        // 2. Get the prompt data
        const { data: prompt, error: promptError } = await supabase
          .from("prompts")
          .select(
            `
            id,
            title,
            description,
            system_prompt,
            user_prompt,
            version,
            token_count,
            category_id
          `
          )
          .eq("id", shareRecord.prompt_id)
          .single();

        if (promptError) {
          console.error("Error fetching prompt:", promptError);
          setError(promptError.message || "Prompt not found");
          return;
        }

        if (!prompt) {
          console.error("No prompt found for id:", shareRecord.prompt_id);
          setError("Prompt not found");
          return;
        }

        console.log("Found prompt:", prompt);
        setPromptData(prompt);

        // 3. Increment view count
        const { error: updateError } = await supabase
          .from("prompt_shares")
          .update({ views: (shareRecord.views || 0) + 1 })
          .eq("id", shareRecord.id);

        if (updateError) {
          console.error("Error updating view count:", updateError);
        } else {
          setViewCount((shareRecord.views || 0) + 1);
        }
      } catch (err: any) {
        console.error("Error loading shared prompt:", err);
        setError(err.message || "Failed to load shared prompt");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Update meta data when prompt data changes
  useEffect(() => {
    if (promptData) {
      const title = `${promptData.title} - Promplify`;
      const description = promptData.description || "A shared AI prompt from Promplify";
      const keywords = `AI prompt, ${promptData.title}, prompt sharing, AI assistant, prompt engineering`;

      updateMeta(title, description, keywords);
    }
  }, [promptData]);

  const handleSavePrompt = async () => {
    if (!promptData) {
      toast.error("No prompt data available to save");
      return;
    }

    try {
      setIsSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to save this prompt");
        return;
      }

      const { id, created_at, updated_at, ...dataToSave } = promptData;

      const { data: newPrompt, error } = await supabase
        .from("prompts")
        .insert({
          ...dataToSave,
          id: crypto.randomUUID(),
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Prompt saved successfully");
    } catch (err: any) {
      console.error("Error saving prompt:", err);
      toast.error(err.message || "Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <SEO title="Loading Shared Prompt - Promplify" description="Loading a shared AI prompt from Promplify" canonicalPath={`/share/${token}`} />
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/10 rounded w-64"></div>
            <div className="h-32 bg-white/10 rounded w-96"></div>
            <div className="text-gray-400 mt-4 text-center">Loading prompt data...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !promptData) {
    return (
      <div className="min-h-screen bg-black">
        <SEO title="Prompt Not Found - Promplify" description="The shared prompt you're looking for might have been removed or is no longer accessible" canonicalPath={`/share/${token}`} />
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Prompt Not Found</h2>
            <p className="text-gray-400 mb-4">{error || "The prompt you're looking for might have been removed or is no longer accessible."}</p>
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Return to Homepage
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <SEO
        title={`${promptData.title} - Promplify`}
        description={promptData.description || "A shared AI prompt from Promplify"}
        canonicalPath={`/share/${token}`}
        keywords={`AI prompt, ${promptData.title}, prompt sharing, AI assistant, prompt engineering`}
      />
      <Navigation />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-white">{promptData.title}</h1>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                    v{promptData.version || "1.0.0"}
                  </Badge>
                </div>
                {promptData.description && <p className="text-gray-400">{promptData.description}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount}</span>
                </div>
                <Button onClick={handleSavePrompt} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                  {isSaving ? "Saving..." : "Save to My Prompts"}
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {promptData.system_prompt && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-300">System Prompt</Label>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => handleCopyPrompt(promptData.system_prompt)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300">{promptData.system_prompt}</pre>
                </div>
              </div>
            )}

            {promptData.user_prompt && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-300">User Prompt</Label>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => handleCopyPrompt(promptData.user_prompt)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300">{promptData.user_prompt}</pre>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                {promptData.token_count || 0} tokens
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                AI Assistant
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
