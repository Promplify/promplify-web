"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getSharedPrompt, saveSharedPrompt } from "@/services/shareService";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SharedPromptView({ token }: { token: string }) {
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClientComponentClient();
  const [prompt, setPrompt] = useState<any>(null);
  const [shareRecord, setShareRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSavePrompt = async () => {
    try {
      setIsSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to save this prompt");
        return;
      }

      await saveSharedPrompt(prompt.prompts, session.user.id);
      toast.success("Prompt saved successfully");
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadSharedPrompt = async () => {
      try {
        setIsLoading(true);
        const data = await getSharedPrompt(token);
        if (!data || !data.prompts) {
          setError("Prompt not found");
          return;
        }
        setPrompt(data);
        setShareRecord(data);
      } catch (error) {
        console.error("Error loading shared prompt:", error);
        setError("Failed to load shared prompt");
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedPrompt();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-32 bg-gray-200 rounded w-96"></div>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Prompt Not Found</h2>
          <p className="text-gray-600">The prompt you're looking for might have been removed or is no longer accessible.</p>
        </div>
      </div>
    );
  }

  const promptData = prompt.prompts;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">{promptData.title}</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{shareRecord.views} views</span>
                <Button onClick={handleSavePrompt} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save to My Prompts"}
                </Button>
              </div>
            </div>
            {promptData.description && <p className="mt-2 text-sm text-gray-600">{promptData.description}</p>}
          </div>

          <div className="px-6 py-4 space-y-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">System Prompt</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-mono">{promptData.system_prompt}</pre>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">User Prompt</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <pre className="text-sm whitespace-pre-wrap font-mono">{promptData.user_prompt}</pre>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Version {promptData.version}</span>
              <span>•</span>
              <span>{promptData.token_count} tokens</span>
              {promptData.prompt_tags?.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-2">
                    {promptData.prompt_tags.map(({ tags }: any) => (
                      <span key={tags.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tags.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
