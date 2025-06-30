import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { SocialShare } from "@/components/share/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { countTokens } from "gpt-tokenizer/model/gpt-4";
import { ChevronRight, Copy, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function TemplatePage() {
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Get the template data
        const { data: template, error: templateError } = await supabase.from("prompt_template").select("*").eq("id", id).single();

        if (templateError) {
          setError(templateError.message || "Template not found");
          return;
        }

        if (!template) {
          setError("Template not found");
          return;
        }

        // Calculate token count
        const systemTokens = template.system_prompt ? Math.ceil(countTokens(template.system_prompt)) : 0;
        template.token_count = systemTokens;

        setTemplateData(template);
        setViewCount(template.views || 0);

        // Update view count
        try {
          // Execute update operation
          const { error: updateError } = await supabase
            .from("prompt_template")
            .update({ views: (template.views || 0) + 1 })
            .eq("id", template.id);

          if (updateError) {
            console.warn("Failed to update view count:", updateError);
          } else {
            // Re-fetch data after update to confirm success
            const { data: refreshData, error: refreshError } = await supabase.from("prompt_template").select("views").eq("id", template.id).single();

            if (!refreshError && refreshData) {
              setViewCount(refreshData.views);
            } else {
              setViewCount((template.views || 0) + 1);
            }
          }
        } catch (updateErr) {
          console.warn("Failed to update view count:", updateErr);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load template");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Update meta data when template data changes
  useEffect(() => {
    if (templateData) {
      const title = `${templateData.title} - Promplify`;
      const description = templateData.description || "A prompt template from Promplify";
      const keywords = `AI prompt, ${templateData.title}, prompt template, AI assistant, prompt engineering`;

      updateMeta(title, description, keywords);
    }
  }, [templateData]);

  const handleSavePrompt = async () => {
    if (!templateData) {
      toast.error("No template data available to save");
      return;
    }

    try {
      setIsSaving(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Please sign in to save this template");
        return;
      }

      const systemTokens = templateData.system_prompt ? Math.ceil(countTokens(templateData.system_prompt)) : 0;
      const userTokens = 0;
      const totalTokens = systemTokens + userTokens;

      const promptData = {
        id: crypto.randomUUID(),
        title: templateData.title,
        description: "",
        content: "",
        version: "1.0.0",
        token_count: totalTokens,
        system_tokens: systemTokens,
        user_tokens: userTokens,
        performance: 0,
        is_favorite: false,
        model: "gpt-4",
        temperature: 0.7,
        max_tokens: 2000,
        system_prompt: templateData.system_prompt,
        user_prompt: "",
        category_id: null,
        user_id: session.user.id,
      };

      const { error } = await supabase.from("prompts").insert(promptData);

      if (error) {
        throw error;
      }

      toast.success("Template saved successfully");
    } catch (err: any) {
      console.error("Error saving template:", err);
      toast.error(err.message || "Failed to save template");
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
        <SEO title="Loading Template - Promplify" description="Loading a prompt template from Promplify" canonicalPath={`/template/${id}`} />
        <Navigation />
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-6 w-48 bg-white/10 rounded animate-pulse"></div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-64 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-4 w-96 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-32 bg-white/10 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="h-6 w-24 bg-white/10 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-white/10 rounded animate-pulse"></div>
                <div className="h-6 w-28 bg-white/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !templateData) {
    return (
      <div className="min-h-screen bg-black">
        <SEO title="Template Not Found - Promplify" description="The template you're looking for might have been removed or is no longer accessible" canonicalPath={`/template/${id}`} />
        <Navigation />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">Template Not Found</h2>
            <p className="text-gray-400 mb-4">{error || "The template you're looking for might have been removed or is no longer accessible."}</p>
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
        title={`${templateData.title} - Promplify`}
        description={templateData.description || "A prompt template from Promplify"}
        canonicalPath={`/template/${id}`}
        keywords={`AI prompt, ${templateData.title}, prompt template, AI assistant, prompt engineering`}
      />
      <Navigation />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/templates" className="text-gray-400 hover:text-white transition-colors">
                    Templates
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">{templateData.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl rounded-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-semibold text-white">{templateData.title}</h1>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                    v{templateData.version || "1.0.0"}
                  </Badge>
                </div>
                {templateData.description && <p className="text-gray-400">{templateData.description}</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{viewCount}</span>
                </div>
                <SocialShare title={templateData.title} url={window.location.href} description={templateData.description || "A prompt template from Promplify"} image="/og-image.png" />
                <Button onClick={handleSavePrompt} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700">
                  {isSaving ? "Saving..." : "Save to My Prompts"}
                </Button>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {templateData.system_prompt && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium text-gray-300">System Prompt</Label>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10" onClick={() => handleCopyPrompt(templateData.system_prompt)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <pre className="text-sm whitespace-pre-wrap font-mono text-gray-300">{templateData.system_prompt}</pre>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/10">
              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                {templateData.token_count || 0} tokens
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
