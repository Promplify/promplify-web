import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [user, setUser] = useState<any>(null);
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

    // Get user information for the prompt
    const fetchUser = async () => {
      if (!discoverPrompt.user_id) {
        setIsLoadingData(false);
        return;
      }

      try {
        // 尝试从profiles表获取用户信息
        const { data: profileData, error: profileError } = await supabase.from("profiles").select("id, username, full_name, avatar_url").eq("id", discoverPrompt.user_id).single();

        if (profileData) {
          setUser(profileData);
        } else {
          // 如果没有找到用户信息，设置一个默认值
          setUser({
            id: discoverPrompt.user_id,
            full_name: "Anonymous User",
            username: "user",
            avatar_url: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser({
          id: discoverPrompt.user_id,
          full_name: "Anonymous User",
          username: "user",
          avatar_url: "",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    checkSession();
    fetchUser();
  }, [discoverPrompt.user_id]);

  // 保证 likesCount 能响应外部 props 变化
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
        // 取消点赞
        await unlikeDiscoverPrompt(discoverPrompt.id);
        setLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        toast.success("Like removed");
      } else {
        // 点赞
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

  // 自动查 tag - 直接从数据库获取，绕过 RLS
  useEffect(() => {
    if (!hasTags && discoverPrompt.prompt?.id) {
      setIsLoadingTags(true);

      // 直接从 Supabase 获取标签，而不使用封装的函数
      supabase
        .from("prompt_tags")
        .select(
          `
          tags (
            id,
            name
          )
        `
        )
        .eq("prompt_id", discoverPrompt.prompt.id)
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching tags:", error);
            return;
          }

          if (data && Array.isArray(data) && data.length > 0) {
            // 从嵌套数据中提取标签
            const extractedTags = data.map((item) => item.tags).filter(Boolean);
            setFetchedTags(extractedTags);

            // 添加日志来调试标签加载
            console.log("Loaded tags for prompt:", discoverPrompt.prompt.id, extractedTags);
          } else {
            console.log("No tags found for prompt:", discoverPrompt.prompt.id);
          }
        })
        .catch((e) => {
          console.error("Failed to fetch tags:", e);
        })
        .finally(() => {
          setIsLoadingTags(false);
        });
    } else {
      setIsLoadingTags(false);
    }
  }, [discoverPrompt.prompt?.id, hasTags]);

  // 渲染用的 tagList
  const tagsList = hasTags
    ? (discoverPrompt.prompt?.prompt_tags || []).slice(0, 3).map((tagItem: any, index: number) => {
        const tag = tagItem.tags || tagItem;
        return {
          id: tag?.id || `tag-${index}`,
          name: tag?.name || "Tag",
        };
      })
    : fetchedTags.slice(0, 3).map((tag: any, index: number) => ({
        id: tag.id || `tag-${index}`,
        name: tag.name || "Tag",
      }));

  if (isLoadingData) {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100">
        {/* Cover placeholder */}
        <div className="h-40 bg-gray-200 animate-pulse"></div>

        {/* Content placeholder */}
        <div className="p-4 flex-1 flex flex-col">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />

          {/* Tags placeholder */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>

          {/* Footer placeholder */}
          <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center">
              <Skeleton className="h-6 w-6 rounded-full mr-2" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-7 w-12 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md cursor-pointer border border-gray-100 ${
        featured ? "transform hover:-translate-y-1" : ""
      }`}
      onClick={navigateToDetail}
    >
      {/* Cover image or gradient */}
      <div
        className={`h-40 bg-gradient-to-br ${gradientColors[cardGradient]} flex items-center justify-center relative`}
        style={discoverPrompt.cover_image_url ? { backgroundImage: `url(${discoverPrompt.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center", objectFit: "cover" } : {}}
      >
        {!discoverPrompt.cover_image_url && (
          <span className="text-white text-2xl font-bold px-6 text-center drop-shadow-md">
            {title.slice(0, 20)}
            {title.length > 20 ? "..." : ""}
          </span>
        )}
        {featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-white/80 backdrop-blur-sm text-black font-medium px-2 py-0.5">Featured</Badge>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 flex-1 flex flex-col">
        {description && <p className="text-gray-600 text-sm mb-2 line-clamp-2">{description}</p>}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2 min-h-[26px]">
          {isLoadingTags ? (
            <>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
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
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[colorIndex].bg} ${colors[colorIndex].border} ${colors[colorIndex].text} hover:bg-opacity-80 transition-colors`}
                >
                  {tag.name}
                </Badge>
              );
            })
          ) : (
            <Badge variant="outline" className="px-2 py-0.5 rounded-full text-xs font-medium text-gray-500 border-gray-300">
              No tags
            </Badge>
          )}
        </div>

        {/* Footer with user and likes */}
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-600 hover:text-gray-800 transition-colors">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={user?.avatar_url} alt={user?.full_name || user?.username || "Anonymous"} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-white text-xs">{(user?.full_name || user?.username || "A").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{user ? user.full_name || user.username || "Anonymous" : "Anonymous"}</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-2 py-1 h-7 min-w-[50px] rounded-full ${liked ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-600 hover:bg-gray-100"} transition-all duration-200`}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-blue-500 stroke-blue-500" : "stroke-gray-600"} mr-1`} strokeWidth={2} />
                  <span className="text-xs">{likesCount}</span>
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
