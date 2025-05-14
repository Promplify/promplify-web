import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { likePlazaPrompt, savePlazaPromptToMyList, unlikePlazaPrompt } from "@/services/plazaService";
import { PlazaPrompt } from "@/types/plaza";
import { Heart, Save } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PlazaCardProps {
  plazaPrompt: PlazaPrompt;
  featured?: boolean;
}

export function PlazaCard({ plazaPrompt, featured = false }: PlazaCardProps) {
  const [liked, setLiked] = useState(plazaPrompt.user_has_liked || false);
  const [likesCount, setLikesCount] = useState(plazaPrompt.likes_count || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  // Handle like/unlike
  const handleLike = async () => {
    try {
      setIsLoading(true);

      // Check if user is logged in
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      if (liked) {
        await unlikePlazaPrompt(plazaPrompt.id);
        setLikesCount((prev) => prev - 1);
        setLiked(false);
        toast.success("Like removed");
      } else {
        await likePlazaPrompt(plazaPrompt.id);
        setLikesCount((prev) => prev + 1);
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

  // Save to my prompts
  const handleSave = async () => {
    try {
      setIsLoading(true);

      // Check if user is logged in
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error("Please log in first");
        navigate("/auth");
        return;
      }

      await savePlazaPromptToMyList(plazaPrompt.id);
      toast.success("Prompt saved to your list");
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Save failed, please try again");
    } finally {
      setIsLoading(false);
    }
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

  const cardGradient = plazaPrompt.id.charCodeAt(0) % gradientColors.length;
  const title = plazaPrompt.prompt?.title || "Untitled";
  const description = plazaPrompt.prompt?.description || "";

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full transition-all duration-300 ${featured ? "transform hover:-translate-y-1 hover:shadow-lg" : ""}`}>
        {/* Cover image or gradient */}
        <div
          className={`h-40 bg-gradient-to-br ${gradientColors[cardGradient]} flex items-center justify-center`}
          onClick={() => setShowDetails(true)}
          style={plazaPrompt.cover_image_url ? { backgroundImage: `url(${plazaPrompt.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
        >
          {!plazaPrompt.cover_image_url && (
            <span className="text-white text-2xl font-bold px-4 text-center">
              {title.slice(0, 20)}
              {title.length > 20 ? "..." : ""}
            </span>
          )}
        </div>

        {/* Card content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 cursor-pointer hover:text-[#2C106A] transition-colors line-clamp-2" onClick={() => setShowDetails(true)}>
            {title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

          {featured && <Badge className="bg-[#2C106A] mb-3 self-start">Featured</Badge>}

          <div className="mt-auto flex justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className={`gap-1.5 ${liked ? "text-red-500" : "text-gray-500"}`} onClick={handleLike} disabled={isLoading}>
                    <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
                    <span>{likesCount}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{liked ? "Unlike" : "Like"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/10" onClick={handleSave} disabled={isLoading}>
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Save to my prompts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Prompt details dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{plazaPrompt.prompt?.title}</DialogTitle>
            <DialogDescription>{plazaPrompt.prompt?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-1">System Prompt:</h4>
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">{plazaPrompt.prompt?.system_prompt}</div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">User Prompt:</h4>
              <div className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">{plazaPrompt.prompt?.user_prompt}</div>
            </div>

            <div className="pt-4 flex justify-between border-t">
              <div className="space-x-2">
                <Badge variant="outline">{plazaPrompt.prompt?.model}</Badge>
                <Badge variant="outline">Temperature: {plazaPrompt.prompt?.temperature}</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className={`gap-1.5 ${liked ? "text-red-500 border-red-200" : "text-gray-500"}`} onClick={handleLike} disabled={isLoading}>
                  <Heart className={`h-4 w-4 ${liked ? "fill-red-500" : ""}`} />
                  <span>{likesCount}</span>
                </Button>

                <Button size="sm" className="gap-1.5 bg-[#2C106A] hover:bg-[#1F0B4C]" onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4" />
                  <span>Save to My Prompts</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
