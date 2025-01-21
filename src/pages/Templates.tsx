import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { createPrompt } from "@/services/promptService";
import { updateMeta } from "@/utils/meta";
import { countTokens } from "gpt-tokenizer/model/gpt-4";
import { ArrowRight, Copy, Search, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

type Template = {
  id: number;
  title: string;
  system_prompt: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100,
  });

  useEffect(() => {
    updateMeta("Prompt Templates", "Browse and use our curated collection of AI prompt templates", "AI prompts, prompt templates, prompt engineering, AI assistant templates");
  }, []);

  const fetchTemplates = async () => {
    try {
      const from = page * 30;
      const to = from + 29;

      let query = supabase.from("prompt_template").select("*");

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,system_prompt.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query.range(from, to).order("created_at", { ascending: false });

      if (error) throw error;

      if (data.length < 30) {
        setHasMore(false);
      }

      if (page === 0) {
        setTemplates(data);
      } else {
        setTemplates((prev) => [...prev, ...data]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [page, searchQuery]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setLoading(true);
  }, [searchQuery]);

  const handleUseTemplate = async (template: Template) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user.id) {
        toast.error("Please login first");
        return;
      }

      const systemTokens = countTokens(template.system_prompt || "");
      const userTokens = 0; // No user prompt initially
      const totalTokens = systemTokens + userTokens;

      const promptData = {
        id: uuidv4(),
        title: template.title,
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
        system_prompt: template.system_prompt,
        user_prompt: "",
        category_id: null,
        user_id: session.data.session.user.id,
      };

      const newPrompt = await createPrompt(promptData);
      toast.success("Template copied to your prompts");

      navigate("/dashboard", {
        state: {
          selectedPromptId: newPrompt.id,
          source: "template",
        },
      });
    } catch (error) {
      console.error("Error using template:", error);
      toast.error("Failed to use template");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#2C106A]/5 text-[#2C106A] text-sm font-medium border border-[#2C106A]/10">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Discover AI Prompt Templates</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-5 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 sm:text-5xl">Prompt Templates</h1>
            <p className="text-gray-600 text-lg mb-5 font-medium">Browse and use our curated collection of prompt templates</p>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C106A] to-purple-600 rounded-full blur-md opacity-25 group-hover:opacity-30 transition-opacity" />
              <div className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm transition-shadow group-hover:shadow-md">
                <div className="flex-none pl-5">
                  {isSearching ? <div className="w-5 h-5 border-2 border-[#2C106A] border-t-transparent rounded-full animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
                </div>
                <Input
                  type="text"
                  placeholder="Search templates by title, content, or category..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  className="flex-1 h-14 px-4 py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-base placeholder:text-gray-400"
                  style={{ boxShadow: "none" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="flex-none pr-5 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            {searchQuery && !loading && templates.length === 0 && <div className="text-center mt-4 text-sm text-gray-500">No templates found for "{searchQuery}"</div>}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-10">
            <span>Templates are sourced from</span>
            <a
              href="https://github.com/f/awesome-chatgpt-prompts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#2C106A] hover:text-[#2C106A]/80 font-medium transition-colors"
            >
              awesome-chatgpt-prompts
              <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 7h10v10M7 17L17 7" />
              </svg>
            </a>
            <span className="px-2 text-gray-300">•</span>
            <span>an open-source collection of ChatGPT prompts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="group relative overflow-hidden border border-gray-200/75 hover:border-[#2C106A]/20 bg-white hover:shadow-lg transition-all duration-300 rounded-lg will-change-transform hover:-translate-y-0.5"
              >
                <CardHeader className="pb-3 px-5 pt-5 border-b border-gray-100">
                  <div className="space-y-2.5">
                    <CardTitle className="text-lg font-semibold leading-tight tracking-tight text-gray-900">{template.title}</CardTitle>
                    {template.category && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#2C106A]/5 text-[#2C106A] border border-[#2C106A]/10">
                          <Tag className="w-3 h-3 mr-1.5 stroke-[2.5]" />
                          {template.category}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-5 pt-4 pb-2">
                  <div className="relative">
                    <div
                      className="font-mono text-[13px] leading-relaxed bg-gray-50/50 px-4 py-3.5 rounded-lg border border-gray-100 h-[220px] overflow-y-auto custom-scrollbar"
                      style={{
                        WebkitLineClamp: 10,
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {template.system_prompt}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-50/95 via-gray-50/80 to-transparent pointer-events-none" />
                  </div>
                </CardContent>

                <CardFooter className="px-5 pt-3 pb-5">
                  <div className="w-full flex items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gray-200 hover:border-[#2C106A]/30 transition-colors font-medium group/copy"
                      onClick={() => {
                        navigator.clipboard.writeText(template.system_prompt);
                        toast.success("Prompt copied to clipboard");
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1.5 stroke-[2.5] group-hover/copy:scale-110 transition-transform" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                      className="flex-[2] bg-[#2C106A] hover:bg-[#2C106A]/90 text-white font-medium shadow-sm hover:shadow transition-all duration-200 group/use relative overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center">
                        Use Template
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5 stroke-[2.5] group-hover/use:translate-x-0.5 transition-transform" />
                      </span>
                      <span className="absolute inset-0 bg-white transform -translate-x-full group-hover/use:translate-x-0 transition-transform duration-300 opacity-10" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Loading States */}
          {loading && page === 0 ? (
            // Initial loading
            <div className="flex justify-center my-12">
              <div className="flex flex-col items-center gap-4 text-gray-500">
                <div className="w-8 h-8 border-3 border-[#2C106A] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading templates...</span>
              </div>
            </div>
          ) : loading && page > 0 ? (
            // Loading more (pagination)
            <div className="flex justify-center my-8 py-4 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-[#2C106A] border-t-transparent rounded-full animate-spin" />
                  <span>Loading more templates...</span>
                </div>
              </div>
            </div>
          ) : null}

          {!loading && !hasMore && templates.length > 0 && (
            <div className="text-center my-12 animate-fade-in">
              <div className="inline-block px-4 py-2 rounded-full bg-gray-50 border border-gray-100">
                <p className="text-sm font-medium text-gray-600">You've reached the end of the list</p>
                <p className="text-xs mt-1 text-gray-400">Check back later for more templates</p>
              </div>
            </div>
          )}

          {/* Intersection Observer Target */}
          <div ref={ref} className="h-20" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
