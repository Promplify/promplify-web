import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { likeDiscoverPrompt, saveDiscoverPromptToMyList, unlikeDiscoverPrompt } from "@/services/plazaService";
import { getTagsByPromptId } from "@/services/promptService";
import { DiscoverPrompt } from "@/types/discover";
import { ArrowUp, ChevronRight, Copy, Save, Share2, ThumbsUp, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function DiscoverPromptPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discoverPrompt, setDiscoverPrompt] = useState<DiscoverPrompt | null>(null);
  const [user, setUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [metaData, setMetaData] = useState({
    title: "Prompt Details - Promplify Discover",
    description: "Explore AI prompts shared by the Promplify community",
    keywords: "AI prompt, prompt sharing, ChatGPT prompts, Claude prompts, AI assistant, prompt engineering",
  });

  // Check user session & fetch discover prompt data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        setIsLoggedIn(!!sessionData.session);
        setCurrentUserId(sessionData.session?.user.id || null);

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

        // Fetch tags if not present in the prompt data
        if (promptData.prompt && promptData.prompt.id) {
          try {
            const promptTags = await getTagsByPromptId(promptData.prompt.id);
            setTags(promptTags);
          } catch (error) {
            console.error("Error fetching tags:", error);
          }
        }

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

  // Add scroll listener for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update metadata for SEO
  useEffect(() => {
    if (discoverPrompt?.prompt) {
      const title = `${discoverPrompt.prompt.title} - Promplify Discover`;
      const description = discoverPrompt.prompt.description || `Explore this "${discoverPrompt.prompt.title}" prompt shared by the Promplify community.`;
      const keywords = `AI prompt, ${discoverPrompt.prompt.title}, prompt sharing, ChatGPT prompts, Claude prompts, AI assistant, prompt engineering, ${tags.map((tag: any) => tag.name).join(", ")}`;

      setMetaData({ title, description, keywords });
    }
  }, [discoverPrompt, tags]);

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

  // Handle social sharing
  const handleShare = (platform: string) => {
    if (!discoverPrompt?.prompt) return;

    const url = window.location.href;
    const title = discoverPrompt.prompt.title;
    const description = discoverPrompt.prompt.description || "Check out this AI prompt on Promplify";

    let shareUrl = "";

    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}\n\n${description}`)}&url=${encodeURIComponent(url)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(`${title}\n\n${description}`)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
        break;
      case "copy":
        navigator.clipboard
          .writeText(url)
          .then(() => toast.success("Link copied to clipboard"))
          .catch(() => toast.error("Failed to copy link"));
        return;
    }

    if (shareUrl) {
      const width = 600;
      const height = 400;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      window.open(
        shareUrl,
        `Share on ${platform}`,
        `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
      );
    }
  };

  // Handle remove from discover
  const handleRemoveFromDiscover = async () => {
    if (!discoverPrompt) return;

    try {
      setIsDeleting(true);

      // Check if current user is the one who shared
      if (currentUserId !== discoverPrompt.user_id) {
        toast.error("You can only remove your own shared prompts");
        return;
      }

      // Perform removal
      const { error } = await supabase.from("plaza_prompts").delete().eq("id", discoverPrompt.id);

      if (error) {
        throw error;
      }

      toast.success("Prompt removed from Discover");
      navigate("/discover");
    } catch (error) {
      console.error("Error removing prompt:", error);
      toast.error("Failed to remove prompt, please try again");
    } finally {
      setIsDeleting(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
      <SEO title={metaData.title} description={metaData.description} canonicalPath={`/discover/prompt/${id}`} keywords={metaData.keywords} />
      <Navigation />

      {/* Back to top button */}
      {showBackToTop && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button size="icon" className="h-10 w-10 rounded-full shadow-lg bg-gray-800/80 hover:bg-gray-900 text-white" onClick={scrollToTop}>
            <ArrowUp className="h-5 w-5" />
            <span className="sr-only">Back to top</span>
          </Button>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mb-4 sm:mb-6">
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
                <BreadcrumbPage className="text-gray-900 truncate max-w-[150px] sm:max-w-[250px] md:max-w-xs">{discoverPrompt.prompt.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 break-words">{discoverPrompt.prompt.title}</h1>
                {discoverPrompt.prompt.description && <p className="text-gray-500 mb-4 text-sm sm:text-base">{discoverPrompt.prompt.description}</p>}
              </div>

              {/* Action buttons group */}
              <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                <Button variant="outline" size="sm" onClick={handleLike} className={`gap-1 sm:gap-1.5 text-xs sm:text-sm ${liked ? "text-blue-500 border-blue-200 bg-blue-50" : ""}`}>
                  <ThumbsUp className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${liked ? "fill-blue-500" : ""}`} />
                  <span>{likesCount}</span>
                </Button>

                {currentUserId !== discoverPrompt.user_id && isLoggedIn && (
                  <Button variant="default" size="sm" className="gap-1 sm:gap-1.5 bg-[#2C106A] hover:bg-[#1F0B4C] text-xs sm:text-sm" onClick={handleSave} disabled={isSaving}>
                    <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{isSaving ? "Saving..." : "Save"}</span>
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 sm:gap-1.5 text-xs sm:text-sm">
                  <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>Copy</span>
                </Button>

                {currentUserId === discoverPrompt.user_id && (
                  <Button variant="destructive" size="sm" className="gap-1 sm:gap-1.5 text-xs sm:text-sm" onClick={handleRemoveFromDiscover} disabled={isDeleting}>
                    <Trash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{isDeleting ? "Removing..." : "Remove"}</span>
                  </Button>
                )}
              </div>
            </div>

            {/* User info, tags and share on one line */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
              <div className="flex items-center flex-1 flex-wrap gap-x-3 sm:gap-x-4 gap-y-2">
                {/* User info */}
                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mr-2">
                    <AvatarImage src={user?.avatar_url} alt={user?.full_name || user?.username || "Anonymous"} className="object-cover" />
                    <AvatarFallback className="bg-primary/20 text-white text-xs">{(user?.full_name || user?.username || "A").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user ? user.full_name || user.username || "Anonymous" : "Anonymous"}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {(discoverPrompt.prompt.prompt_tags || tags).length > 0 ? (
                    (discoverPrompt.prompt.prompt_tags || tags).map((tagItem: any) => {
                      const tag = tagItem.tags || tagItem;
                      return (
                        <Badge key={tag.id} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs py-0.5">
                          {tag.name}
                        </Badge>
                      );
                    })
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs py-0.5">
                      No tags
                    </Badge>
                  )}
                </div>
              </div>

              {/* Share */}
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-gray-500 mr-1">Share:</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    aria-label="Share on Twitter"
                  >
                    <svg viewBox="0 0 24 24" className="h-3 w-3 sm:h-4 sm:w-4 fill-current">
                      <path d="M16.99 0h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817L3.736 19.5H.426l7.73-8.835L0 0h6.826l4.713 6.231L16.99 0Zm-1.161 17.52h1.833L5.83 1.876H3.863L15.829 17.52Z" />
                    </svg>
                    <span className="sr-only">Share on X</span>
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    aria-label="Share on Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-3 w-3 sm:h-4 sm:w-4 fill-current">
                      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                    </svg>
                    <span className="sr-only">Share on Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare("linkedin")}
                    className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    aria-label="Share on LinkedIn"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="h-3 w-3 sm:h-4 sm:w-4 fill-current">
                      <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
                    </svg>
                    <span className="sr-only">Share on LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    aria-label="Copy link"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="sr-only">Copy link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h2 className="text-base sm:text-lg font-medium text-gray-900">System Prompt</h2>
                <Badge variant="outline" className="text-xs">
                  {discoverPrompt.prompt.token_count || 0} tokens
                </Badge>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs sm:text-sm whitespace-pre-wrap break-words overflow-auto">
                {discoverPrompt.prompt.system_prompt}
              </div>
            </div>

            {discoverPrompt.prompt.user_prompt && (
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">User Prompt</h2>
                <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs sm:text-sm whitespace-pre-wrap break-words overflow-auto">
                  {discoverPrompt.prompt.user_prompt}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
