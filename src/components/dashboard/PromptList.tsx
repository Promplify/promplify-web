import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { getPrompts, toggleFavorite } from "@/services/promptService";
import { Prompt } from "@/types/prompt";
import { ArrowDownUp, Heart, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PromptListProps {
  categoryId?: string | null;
  onPromptSelect?: (promptId: string) => void;
  selectedPromptId?: string | null;
}

export function PromptList({ categoryId, onPromptSelect, selectedPromptId }: PromptListProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sortByDate, setSortByDate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const fetchPrompts = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (session.data.session?.user.id) {
        const data = await getPrompts(session.data.session.user.id, categoryId || undefined);

        if (selectedPromptId === "new") {
          const newPrompt = {
            id: "new",
            title: "New Prompt",
            description: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_favorite: false,
            user_id: session.data.session.user.id,
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
          setPrompts([newPrompt, ...data]);
          return;
        }

        setPrompts(data);

        if ((!selectedPromptId || !data.find((p) => p.id === selectedPromptId)) && data.length > 0) {
          onPromptSelect?.(data[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast.error("Failed to load prompts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, [categoryId, selectedPromptId]);

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
      setPrompts(prompts.map((p) => (p.id === id ? { ...p, is_favorite: !currentFavorite } : p)));
      toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const filteredPrompts = prompts.filter(
    (prompt) =>
      prompt.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      prompt.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      prompt.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1;
    }
    return sortByDate ? new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime() : new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
  });

  const handleNewPrompt = () => {
    onPromptSelect?.("new");
  };

  if (isLoading) {
    return (
      <div className="w-[320px] h-full bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
        <div className="p-2">
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[320px] h-full bg-white">
      <div className="p-4 border-b border-gray-200">
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
          <span className="bg-gray-100 px-2 py-1 rounded-md transition-colors duration-200">{sortedPrompts.length} prompts</span>
          <button
            onClick={() => setSortByDate(!sortByDate)}
            className="flex items-center space-x-1 min-w-[100px] justify-center hover:text-gray-900 bg-gray-50 px-2 py-1 rounded-md transition-all duration-200 hover:bg-gray-100"
          >
            <ArrowDownUp size={14} className="transition-transform duration-200" />
            <span>Sort by {sortByDate ? "newest" : "oldest"}</span>
          </button>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100%-145px)] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="p-2">
          <div className="space-y-2">
            {sortedPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className={`p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200 group relative transition-all duration-200 ${
                  selectedPromptId === prompt.id ? "bg-gray-50 border-gray-200 ring-1 ring-[#2C106A] shadow-sm" : ""
                }`}
                onClick={() => onPromptSelect?.(prompt.id)}
              >
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
                    <span className="text-xs text-gray-500">{prompt.version}</span>
                  </div>
                </div>
                {prompt.description && <p className="text-sm text-gray-500 mb-2 line-clamp-2">{prompt.description}</p>}
                {prompt.prompt_tags && (
                  <div className="flex flex-wrap gap-2">
                    {prompt.prompt_tags.map(({ tags }) => (
                      <span key={tags.id} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                        {tags.name}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{prompt.token_count || 0} tokens</span>
                  <span>Updated {new Date(prompt.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
