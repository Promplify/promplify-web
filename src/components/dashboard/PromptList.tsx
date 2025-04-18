import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { getPrompts, toggleFavorite } from "@/services/promptService";
import { Prompt } from "@/types/prompt";
import { ArrowDownUp, Heart, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PromptListProps {
  categoryId?: string | null;
  onPromptSelect?: (promptId: string) => void;
  selectedPromptId?: string | null;
  onTotalPromptsChange?: (total: number) => void;
}

export function PromptList({ categoryId, onPromptSelect, selectedPromptId, onTotalPromptsChange }: PromptListProps) {
  const [localPrompts, setLocalPrompts] = useState<Prompt[]>([]);
  const [sortByDate, setSortByDate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

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

        if (!selectedPromptId && data.length > 0) {
          const firstItem = data.sort((a, b) => {
            if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
            return sortByDate ? new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() : new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          })[0];
          onPromptSelect?.(firstItem.id);
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
  }, [fetchPrompts]);

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
    if (a.id === "new") return -1;
    if (b.id === "new") return 1;
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1;
    }
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
            <Plus className="w-4 h-4 mr-2" />
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
                  selectedPromptId === prompt.id ? "bg-gray-50 border-gray-200 ring-1 ring-[#2C106A] shadow-sm" : ""
                }`}
                onClick={() => (prompt.id !== "new" ? onPromptSelect?.(prompt.id) : null)}
              >
                {prompt.id === "new" ? (
                  <div>
                    <h3 className="font-medium text-gray-900 truncate flex-1 italic">New Prompt...</h3>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate flex-1">{prompt.title}</h3>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e, prompt.id, prompt.is_favorite);
                          }}
                          className={`transition-opacity ${prompt.is_favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        >
                          <Heart size={14} className={`transition-colors hover:text-red-500 ${prompt.is_favorite ? "text-red-500 fill-current" : "text-gray-400"}`} />
                        </button>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-purple-200 text-purple-700">Version {prompt.version}</span>
                      </div>
                    </div>
                    {prompt.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{prompt.description}</p>}
                    {prompt.prompt_tags && prompt.prompt_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {prompt.prompt_tags.map(
                          ({ tags }) =>
                            tags && (
                              <span key={tags.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-green-200 text-green-700">
                                {tags.name}
                              </span>
                            )
                        )}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200 text-blue-700">{prompt.token_count || 0} tokens</span>
                      <span>Updated {new Date(prompt.updated_at || prompt.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
            {sortedPrompts.filter((p) => p.id !== "new").length === 0 && !isLoading && <div className="text-center text-gray-500 py-4">No prompts found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
