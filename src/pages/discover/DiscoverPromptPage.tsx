import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { SocialShare } from "@/components/share/SocialShare";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { likeDiscoverPrompt, saveDiscoverPromptToMyList, unlikeDiscoverPrompt } from "@/services/plazaService";
import { DiscoverPrompt } from "@/types/discover";
import { updateMeta } from "@/utils/meta";
import { ChevronRight, Copy, Save, ThumbsUp, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function DiscoverPromptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoverPrompt, setDiscoverPrompt] = useState<DiscoverPrompt | null>(null);
  const [user, setUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check user session & fetch discover prompt data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        setIsLoggedIn(!!sessionData.session);

        // Get discover prompt data
        const { data: promptData, error: promptError } = await supabase
          .from("plaza_prompts")
          .select(
            `
            *,
            prompt:prompts(*),
            user_has_liked:plaza_likes!plaza_likes_plaza_prompt_id_fkey(user_id)
          `
          )
          .eq("id", id)
          .single();

        if (promptError) {
          if (promptError.code === "PGRST116") {
            setError("Prompt not found");
          } else {
            setError(promptError.message || "Failed to load prompt data");
          }
          return;
        }

        if (!promptData) {
          setError("Prompt not found");
          return;
        }

        // Process user likes
        const userHasLiked = promptData.user_has_liked?.some((like: any) => like.user_id === sessionData.session?.user.id) || false;

        const processedPrompt = {
          ...promptData,
          user_has_liked: userHasLiked,
        };

        setDiscoverPrompt(processedPrompt);
        setLiked(userHasLiked);
        setLikesCount(processedPrompt.likes_count || 0);

        // Fetch user data if available
        if (promptData.user_id) {
          try {
            const { data: profileData } = await supabase.from("profiles").select("id, username, full_name, avatar_url").eq("id", promptData.user_id).single();

            if (profileData) {
              setUser(profileData);
            } else {
              setUser({
                id: promptData.user_id,
                full_name: "Anonymous User",
                username: "user",
                avatar_url: "",
              });
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            setUser({
              id: promptData.user_id,
              full_name: "Anonymous User",
              username: "user",
              avatar_url: "",
            });
          }
        }
      } catch (err: any) {
        console.error("Error loading discover prompt:", err);
        setError(err.message || "Failed to load prompt");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Update metadata for SEO
  useEffect(() => {
    if (discoverPrompt?.prompt) {
      const title = `${discoverPrompt.prompt.title} - Promplify Discover`;
      const description = discoverPrompt.prompt.description || "A community shared AI prompt from Promplify";
      const keywords = `AI prompt, ${discoverPrompt.prompt.title}, prompt sharing, AI assistant, prompt engineering`;

      updateMeta(title, description, keywords);
    }
  }, [discoverPrompt]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }

    if (!discoverPrompt) return;

    try {
      if (liked) {
        await unlikeDiscoverPrompt(discoverPrompt.id);
        setLikesCount((prev) => Math.max(0, prev - 1));
        setLiked(false);
        toast.success("Like removed");
      } else {
        await likeDiscoverPrompt(discoverPrompt.id);
        setLikesCount((prev) => prev + 1);
        setLiked(true);
        toast.success("Prompt liked");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Operation failed, please try again");
    }
  };

  // Save prompt to my prompts
  const handleSave = async () => {
    if (!discoverPrompt) return;

    try {
      setIsSaving(true);

      // Check if user is logged in
      if (!isLoggedIn) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      await saveDiscoverPromptToMyList(discoverPrompt.id);
      toast.success("Prompt saved to your list");
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Save failed, please try again");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy prompt to clipboard
  const handleCopy = async () => {
    if (!discoverPrompt?.prompt) return;

    const content = `System Prompt:\n${discoverPrompt.prompt.system_prompt}\n\nUser Prompt:\n${discoverPrompt.prompt.user_prompt}`;

    try {
      await navigator.clipboard.writeText(content);
      toast.success("Prompt copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="Loading Prompt - Promplify Discover" description="Loading a community shared AI prompt" canonicalPath={`/discover/prompt/${id}`} />
        <Navigation />
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="px-8 py-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !discoverPrompt || !discoverPrompt.prompt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEO title="Prompt Not Found - Promplify Discover" description="The prompt you're looking for might have been removed or is no longer accessible" canonicalPath={`/discover/prompt/${id}`} />
        <Navigation />
        <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-gray-500 hover:text-gray-900">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/discover" className="text-gray-500 hover:text-gray-900">
                      Discover
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900">Error</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="bg-white shadow-lg rounded-lg overflow-hidden p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Prompt Not Found</h2>
            <p className="text-gray-500 mb-4">{error || "The prompt you're looking for might have been removed or is no longer accessible."}</p>
            <Button variant="default" onClick={() => navigate("/discover")}>
              Return to Discover
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Success state - show the prompt details
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={`${discoverPrompt.prompt.title} - Promplify Discover`}
        description={discoverPrompt.prompt.description || "A community shared AI prompt from Promplify"}
        canonicalPath={`/discover/prompt/${id}`}
        keywords={`AI prompt, ${discoverPrompt.prompt.title}, prompt sharing, AI assistant, prompt engineering`}
      />
      <Navigation />
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-gray-500 hover:text-gray-900">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/discover" className="text-gray-500 hover:text-gray-900">
                    Discover
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-gray-900">{discoverPrompt.prompt.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{discoverPrompt.prompt.title}</h1>
                <p className="text-gray-500">{discoverPrompt.prompt.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <SocialShare
                  url={window.location.href}
                  title={`Check out this prompt: ${discoverPrompt.prompt.title}`}
                  description={discoverPrompt.prompt.description || "A great AI prompt from Promplify"}
                />
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </Button>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center mt-4 text-sm text-gray-500">
              <User className="h-4 w-4 mr-1" />
              <span>{user ? user.full_name || user.username || "Anonymous" : "Anonymous"}</span>
            </div>

            {/* Tags */}
            {discoverPrompt.prompt.prompt_tags && discoverPrompt.prompt.prompt_tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {discoverPrompt.prompt.prompt_tags.map(({ tags }) => (
                  <Badge key={tags.id} variant="secondary">
                    {tags.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-medium text-gray-900">System Prompt</h2>
                <Badge variant="outline">{discoverPrompt.prompt.token_count || 0} tokens</Badge>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">{discoverPrompt.prompt.system_prompt}</div>
            </div>

            {discoverPrompt.prompt.user_prompt && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-3">User Prompt</h2>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap">{discoverPrompt.prompt.user_prompt}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{discoverPrompt.prompt.model || "gpt-4"}</Badge>
                <Badge variant="outline">Temperature: {discoverPrompt.prompt.temperature || 0.7}</Badge>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className={`gap-1.5 ${liked ? "text-blue-500 border-blue-200" : ""}`} onClick={handleLike} disabled={!isLoggedIn}>
                  <ThumbsUp className={`h-4 w-4 ${liked ? "fill-blue-500" : ""}`} />
                  <span>{likesCount}</span>
                </Button>

                <Button variant="default" size="sm" className="gap-1.5 bg-[#2C106A] hover:bg-[#1F0B4C]" onClick={handleSave} disabled={isSaving || !isLoggedIn}>
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save to My Prompts"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
