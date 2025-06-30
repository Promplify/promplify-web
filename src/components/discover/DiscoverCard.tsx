import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { likeDiscoverPrompt, unlikeDiscoverPrompt } from "@/services/plazaService";
import { DiscoverPrompt } from "@/types/discover";
import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DiscoverCardProps {
  discoverPrompt: DiscoverPrompt;
  featured?: boolean;
}

export function DiscoverCard({ discoverPrompt, featured = false }: DiscoverCardProps) {
  const [liked, setLiked] = useState(discoverPrompt.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(discoverPrompt.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [fetchedTags, setFetchedTags] = useState<any[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    checkSession();
  }, []);

  // Ensure likesCount responds to external props changes
  useEffect(() => {
    setLikesCount(discoverPrompt.likes_count || 0);
  }, [discoverPrompt.likes_count]);

  // Handle like/unlike
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      if (liked) {
        // Unlike the prompt
        await unlikeDiscoverPrompt(discoverPrompt.id);
        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        toast.success("Like removed");
      } else {
        // Like the prompt
        await likeDiscoverPrompt(discoverPrompt.id);
        setLiked(true);
        setLikesCount((prev) => prev + 1);
        toast.success("Prompt liked");
      }
    } catch (error) {
      console.error("Like operation failed:", error);
      toast.error("Operation failed, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to detail page
  const navigateToDetail = () => {
    navigate(`/discover/prompt/${discoverPrompt.id}`);
  };

  // Default or random cover gradient colors
  const gradientColors = [
    "from-blue-500 to-purple-500",
    "from-green-400 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-yellow-400 to-orange-500",
    "from-red-500 to-rose-500",
    "from-indigo-500 to-sky-500",
  ];

  const cardGradient = discoverPrompt.id.charCodeAt(0) % gradientColors.length;
  const title = discoverPrompt.prompt?.title || "Untitled";
  const description = discoverPrompt.prompt?.description || "";

  // Check if the prompt_tags array exists and has elements
  const hasTags = discoverPrompt.prompt?.prompt_tags && Array.isArray(discoverPrompt.prompt.prompt_tags) && discoverPrompt.prompt.prompt_tags.length > 0;

  // Auto-fetch tags - get directly from database, bypassing RLS
  useEffect(() => {
    const fetchTags = async () => {
      if (!hasTags && discoverPrompt.prompt?.id) {
        setIsLoadingTags(true);

        try {
          // Get tags directly from Supabase without using wrapper functions
          const { data, error } = await supabase
            .from("prompt_tags")
            .select(
              `
              tags (
                id,
                name
              )
            `
            )
            .eq("prompt_id", discoverPrompt.prompt.id);

          if (error) {
            console.error("Error fetching tags:", error);
            return;
          }

          if (data && Array.isArray(data) && data.length > 0) {
            // Extract tags from nested data
            const extractedTags = data.map((item) => item.tags).filter(Boolean);
            setFetchedTags(extractedTags);

            // Add logging for tag loading debug
            console.log("Loaded tags for prompt:", discoverPrompt.prompt.id, extractedTags);
          } else {
            console.log("No tags found for prompt:", discoverPrompt.prompt.id);
          }
        } catch (e) {
          console.error("Failed to fetch tags:", e);
        } finally {
          setIsLoadingTags(false);
        }
      } else {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, [discoverPrompt.prompt?.id, hasTags]);

  // Tags list for rendering
  const tagsList = hasTags
    ? (discoverPrompt.prompt?.prompt_tags || []).slice(0, 2).map((tagItem: any, index: number) => {
        const tag = tagItem.tags || tagItem;
        return {
          id: tag?.id || `tag-${index}`,
          name: tag?.name || "Tag",
        };
      })
    : fetchedTags.slice(0, 2).map((tag: any, index: number) => ({
        id: tag.id || `tag-${index}`,
        name: tag.name || "Tag",
      }));

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 hover:scale-[1.02] cursor-pointer border border-gray-100 hover:border-gray-200 ${
        featured ? "transform hover:-translate-y-2 hover:shadow-xl" : ""
      }`}
      onClick={navigateToDetail}
    >
      {/* Cover image or gradient */}
      <div className={`h-40 ${!discoverPrompt.cover_image_url ? `bg-gradient-to-br ${gradientColors[cardGradient]}` : "bg-white"} flex items-center justify-center relative`}>
        {!discoverPrompt.cover_image_url ? (
          <span className="text-white text-2xl font-bold px-6 text-center drop-shadow-md">
            {title.slice(0, 20)}
            {title.length > 20 ? "..." : ""}
          </span>
        ) : (
          <img src={discoverPrompt.cover_image_url} alt={title} className="max-h-40 max-w-full object-contain" />
        )}
        {featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/80 backdrop-blur-sm text-black font-medium px-2 py-0.5">Featured</Badge>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-1">{title}</h3>

        {/* Description */}
        {description && <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{description}</p>}

        {/* Divider before tags/like section */}
        <div className="w-full h-px bg-gray-100 mb-3"></div>

        {/* Tags and Like button in one row */}
        <div className="flex items-center justify-between gap-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {isLoadingTags ? (
              <>
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </>
            ) : tagsList.length > 0 ? (
              tagsList.map((tag, index) => {
                const colorIndex = index % 6;
                const colors = [
                  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-600" },
                  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-600" },
                  { bg: "bg-green-50", border: "border-green-200", text: "text-green-600" },
                  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600" },
                  { bg: "bg-red-50", border: "border-red-200", text: "text-red-600" },
                  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-600" },
                ];

                return (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${colors[colorIndex].bg} ${colors[colorIndex].border} ${colors[colorIndex].text} hover:bg-opacity-80 transition-colors truncate max-w-[120px]`}
                  >
                    {tag.name}
                  </Badge>
                );
              })
            ) : (
              <Badge variant="outline" className="px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 border-gray-300">
                No tags
              </Badge>
            )}
          </div>

          {/* Like button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-3 py-1.5 h-8 min-w-[60px] rounded-full flex-shrink-0 gap-1 ${
                    liked ? "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200" : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                  } transition-all duration-200`}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-blue-500 stroke-blue-500" : "stroke-gray-600"} mr-1`} strokeWidth={2} />
                  <span className="text-xs font-medium">{likesCount}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 text-white py-1 px-2 text-xs rounded">
                <p>{isLoggedIn ? (liked ? "Unlike" : "Like") : "Log in to like"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
