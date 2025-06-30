import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { getPrompts, toggleFavorite } from "@/services/promptService";
import { Prompt } from "@/types/prompt";
import { ArrowDownUp, Heart, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PromptListProps {
  categoryId?: string | null;
  onPromptSelect?: (promptId: string) => void;
  selectedPromptId?: string | null;
  onTotalPromptsChange?: (total: number) => void;
  refreshTrigger?: number;
}

export function PromptList({ categoryId, onPromptSelect, selectedPromptId, onTotalPromptsChange, refreshTrigger }: PromptListProps) {
  const [localPrompts, setLocalPrompts] = useState<Prompt[]>([]);
  const [sortByDate, setSortByDate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const navigate = useNavigate();

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (session.data.session?.user.id) {
        const userId = session.data.session.user.id;

        const { count } = await supabase.from("prompts").select("*", { count: "exact", head: true }).eq("user_id", userId);
        onTotalPromptsChange?.(count || 0);

        const data = await getPrompts(userId, categoryId || undefined);

        if (selectedPromptId === "new") {
          const newPrompt = {
            id: "new",
            title: "",
            description: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_favorite: false,
            user_id: userId,
            content: "",
            system_prompt: "",
            user_prompt: "",
            version: "1.0.0",
            token_count: 0,
            performance: 0,
            category_id: categoryId || "",
            model: "gpt-4",
            temperature: 0.7,
            max_tokens: 2000,
            prompt_tags: [],
          } as Prompt;
          setLocalPrompts([newPrompt, ...data]);
        } else {
          setLocalPrompts(data);
        }

        // If no prompt is selected and there's data, automatically select the first one
        if (!selectedPromptId && data.length > 0) {
          const sortedData = [...data].sort((a, b) => {
            if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
            return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
          });
          onPromptSelect?.(sortedData[0].id);
        }
        // If the currently selected prompt doesn't exist in the data (e.g., was deleted), automatically select the first one
        else if (selectedPromptId && selectedPromptId !== "new" && data.length > 0 && !data.find((p) => p.id === selectedPromptId)) {
          const sortedData = [...data].sort((a, b) => {
            if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
            return new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime();
          });
          onPromptSelect?.(sortedData[0].id);
        }
      } else {
        setLocalPrompts([]);
        onTotalPromptsChange?.(0);
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast.error("Failed to load prompts");
      setLocalPrompts([]);
      onTotalPromptsChange?.(0);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId, selectedPromptId, onTotalPromptsChange, onPromptSelect, sortByDate]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts, refreshTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleFavorite = async (e: React.MouseEvent, id: string, currentFavorite: boolean) => {
    e.stopPropagation();
    try {
      await toggleFavorite(id, !currentFavorite);
      setLocalPrompts((prevPrompts) => prevPrompts.map((p) => (p.id === id ? { ...p, is_favorite: !currentFavorite } : p)));
      toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const filteredPrompts = localPrompts.filter(
    (prompt) =>
      prompt.id === "new" ||
      prompt.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    // "new" prompt always comes first
    if (a.id === "new") return -1;
    if (b.id === "new") return 1;

    // Favorite prompts come first
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1;
    }

    // Sort by time, prefer updated_at, if not available use created_at
    const dateA = new Date(a.updated_at || a.created_at).getTime();
    const dateB = new Date(b.updated_at || b.created_at).getTime();
    return sortByDate ? dateB - dateA : dateA - dateB;
  });

  const handleNewPrompt = () => {
    if (localPrompts.find((p) => p.id === "new")) {
      onPromptSelect?.("new");
    } else {
      const userId = supabase.auth.getSession().then((s) => s.data.session?.user.id);
      userId.then((id) => {
        if (!id) return;
        const newPromptPlaceholder = {
          id: "new",
          title: "",
          description: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_favorite: false,
          user_id: id,
          content: "",
          system_prompt: "",
          user_prompt: "",
          version: "1.0.0",
          token_count: 0,
          performance: 0,
          category_id: categoryId || "",
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 2000,
          prompt_tags: [],
        } as Prompt;
        setLocalPrompts((prev) => [newPromptPlaceholder, ...prev]);
        onPromptSelect?.("new");
      });
    }
  };

  useEffect(() => {
    if (selectedPromptId !== "new") {
      setLocalPrompts((prev) => prev.filter((p) => p.id !== "new"));
    }
  }, [selectedPromptId, categoryId]);

  if (isLoading && localPrompts.length === 0) {
    return (
      <div className="w-[320px] h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24 animate-pulse" />
              <Skeleton className="h-9 w-28 animate-pulse" />
            </div>
            <Skeleton className="h-10 w-full animate-pulse" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16 animate-pulse" />
              <Skeleton className="h-6 w-24 animate-pulse" />
            </div>
          </div>
        </div>
        <div className="p-2">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32 animate-pulse" />
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4 animate-pulse" />
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full animate-pulse" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-20 animate-pulse" />
                  <Skeleton className="h-4 w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Prompts</h2>
          <Button onClick={handleNewPrompt} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white transition-colors duration-200">
            <Plus className="w-4 h-4" />
            New Prompt
          </Button>
        </div>
        <div className="relative mb-4 group">
          <Search className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-[#2C106A] transition-colors duration-200" size={18} />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 transition-all duration-200 focus:ring-[#2C106A] focus:border-[#2C106A]"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200">{sortedPrompts.filter((p) => p.id !== "new").length} prompts</span>
          <button
            onClick={() => setSortByDate(!sortByDate)}
            className="flex items-center space-x-1 min-w-[100px] justify-center hover:text-gray-900 bg-gray-50 px-2 py-1 rounded-md transition-all duration-200 hover:bg-gray-100"
          >
            <ArrowDownUp size={14} className="transition-transform duration-200" />
            <span>Sort by {sortByDate ? "newest" : "oldest"}</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="p-2">
          <div className="space-y-2 pb-4">
            {sortedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200 group relative transition-all duration-200 ${
                  selectedPromptId === prompt.id ? "bg-gradient-to-r from-purple-50 to-indigo-50 border-[#2C106A] ring-1 ring-[#2C106A] shadow-sm" : ""
                }`}
                onClick={() => (prompt.id !== "new" ? onPromptSelect?.(prompt.id) : null)}
              >
                {prompt.id === "new" ? (
                  <div>
                    <h3 className="font-medium text-gray-900 truncate flex-1 italic">New Prompt...</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-medium text-gray-900 truncate flex-1 pr-2">{prompt.title}</h3>
                      <div className="flex items-center space-x-1">
                        <button type="button" onClick={(e) => handleToggleFavorite(e, prompt.id, prompt.is_favorite)} className="text-gray-400 hover:text-gray-700 group-hover:visible">
                          <Heart size={16} className={`${prompt.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-2">{prompt.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{new Date(prompt.updated_at || prompt.created_at).toLocaleDateString()}</span>
                      <span className="text-gray-400">
                        {prompt.token_count || 0} {prompt.token_count === 1 ? "token" : "tokens"}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
