import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { likeDiscoverPrompt, unlikeDiscoverPrompt } from "@/services/plazaService";
import { DiscoverPrompt } from "@/types/discover";
import { ThumbsUp, User } from "lucide-react";
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
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };

    // Get user information for the prompt
    const fetchUser = async () => {
      if (!discoverPrompt.user_id) return;

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
      }
    };

    checkSession();
    fetchUser();
  }, [discoverPrompt.user_id]);

  // Handle like/unlike
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error("Please log in first");
      navigate("/auth");
      return;
    }

    try {
      setIsLoading(true);

      if (liked) {
        await unlikeDiscoverPrompt(discoverPrompt.id);
        // 直接调用API更新点赞计数
        const { data, error } = await supabase.from("plaza_prompts").select("likes_count").eq("id", discoverPrompt.id).single();

        if (!error && data) {
          setLikesCount(data.likes_count || 0);
        } else {
          setLikesCount((prev) => Math.max(0, prev - 1));
        }

        setLiked(false);
        toast.success("Like removed");
      } else {
        await likeDiscoverPrompt(discoverPrompt.id);
        // 直接调用API更新点赞计数
        const { data, error } = await supabase.from("plaza_prompts").select("likes_count").eq("id", discoverPrompt.id).single();

        if (!error && data) {
          setLikesCount(data.likes_count || 0);
        } else {
          setLikesCount((prev) => prev + 1);
        }

        setLiked(true);
        toast.success("Prompt liked");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
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

  // 添加日志查看标签数据
  useEffect(() => {
    console.log("DiscoverCard prompt_tags:", discoverPrompt.prompt?.prompt_tags);
    console.log("Has tags:", hasTags);
  }, [discoverPrompt, hasTags]);

  // 从标签数据中提取可用的标签
  const extractTags = () => {
    if (!hasTags) return [];

    // 尝试不同的数据格式
    const tagList = discoverPrompt.prompt?.prompt_tags || [];

    return tagList.slice(0, 3).map((tagItem: any, index) => {
      // 处理可能的数据结构: { tags: Tag } 或直接 Tag
      const tag = tagItem.tags || tagItem;
      return {
        id: tag?.id || `tag-${index}`,
        name: tag?.name || "Tag",
      };
    });
  };

  const tagsList = extractTags();

  return (
    <div
      className={`bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-md cursor-pointer border border-gray-100 ${
        featured ? "transform hover:-translate-y-1" : ""
      }`}
      onClick={navigateToDetail}
    >
      {/* Cover image or gradient */}
      <div
        className={`h-48 bg-gradient-to-br ${gradientColors[cardGradient]} flex items-center justify-center relative`}
        style={discoverPrompt.cover_image_url ? { backgroundImage: `url(${discoverPrompt.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
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
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tagsList.length > 0 ? (
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
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600 hover:text-gray-800 transition-colors">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || user.username} className="h-4 w-4 rounded-full mr-1" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                <User className="h-2.5 w-2.5 text-gray-500" strokeWidth={2.5} />
              </div>
            )}
            <span className="font-medium">{user ? user.full_name || user.username || "Anonymous" : "Anonymous"}</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`px-2 py-1 h-6 min-w-[50px] rounded-full ${liked ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "text-gray-600 hover:bg-gray-100"} transition-all duration-200`}
                  onClick={handleLike}
                  disabled={isLoading}
                >
                  <ThumbsUp className={`h-3 w-3 ${liked ? "fill-blue-500 stroke-blue-500" : "stroke-gray-600"} mr-0.5`} strokeWidth={2} />
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
