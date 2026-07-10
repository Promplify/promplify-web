import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackPromptCreated, trackTemplateCtaClicked, trackTemplateOpened, trackTemplateSearch, trackTemplateUsed } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import { createPrompt } from "@/services/promptService";
import { countTokens } from "gpt-tokenizer/model/gpt-4";
import { ArrowRight, BookOpen, Code2, HelpCircle, Megaphone, PenTool, Search, Sparkles, Tag, Workflow, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Link, useNavigate } from "react-router-dom";
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

const PAGE_SIZE = 30;
const templateQuickFilters = ["AI prompt templates", "prompt template tool", "prompt workflow templates", "ChatGPT", "Claude", "Coding", "Research"];
const templateUseCases = [
  {
    title: "ChatGPT prompt templates",
    description: "Reusable prompts for content planning, brainstorming, editing, summaries, and daily assistant workflows.",
    filter: "ChatGPT",
    Icon: Sparkles,
  },
  {
    title: "Claude prompt templates",
    description: "Structured instructions for long-form writing, research synthesis, review workflows, and careful reasoning tasks.",
    filter: "Claude",
    Icon: BookOpen,
  },
  {
    title: "Coding prompt templates",
    description: "Prompts for debugging, refactoring, test planning, code review, and implementation checklists.",
    filter: "Coding",
    Icon: Code2,
  },
  {
    title: "Marketing prompt templates",
    description: "Campaign, landing page, positioning, email, and social content prompts for repeatable go-to-market work.",
    filter: "Marketing",
    Icon: Megaphone,
  },
  {
    title: "Research prompt templates",
    description: "Prompts for literature reviews, source synthesis, interview notes, market scans, and structured analysis.",
    filter: "Research",
    Icon: BookOpen,
  },
  {
    title: "AI workflow templates",
    description: "Prompt workflow templates for repeatable handoffs, review loops, task planning, and multi-step AI workflows.",
    filter: "Workflow",
    Icon: Workflow,
  },
  {
    title: "Prompt template tool",
    description: "Use Promplify as a prompt template tool to search, adapt, save, and reuse strong instructions across projects.",
    filter: "prompt template tool",
    Icon: PenTool,
  },
];
const workflowLinks = [
  {
    title: "Build a prompt library",
    description: "Save reusable AI prompt templates into a searchable prompt library so your best instructions are easy to find again.",
    to: "/auth?mode=register",
    cta: "Create your library",
    target: "create_library",
  },
  {
    title: "Explore community prompts",
    description: "Find shared prompts from the community before you write from scratch, then adapt the best ones to your workflow.",
    to: "/discover/",
    cta: "Browse Discover",
    target: "discover",
  },
  {
    title: "Connect prompts to apps",
    description: "Use saved prompt workflow templates through the Promplify API when your tools need the same instruction set repeatedly.",
    to: "/api-docs/",
    cta: "View API docs",
    target: "api_docs",
  },
];
const longTailSearches = [
  {
    title: "AI prompt templates",
    description: "Start from reusable templates for ChatGPT, Claude, coding, research, marketing, and writing workflows.",
    query: "AI prompt templates",
  },
  {
    title: "Prompt template tool",
    description: "Use Promplify to search templates, copy them into your workspace, and keep a prompt library for repeatable work.",
    query: "prompt template tool",
  },
  {
    title: "Prompt workflow templates",
    description: "Turn recurring tasks into repeatable prompt workflows with clear context, output format, and review steps.",
    query: "prompt workflow templates",
  },
];
const faqItems = [
  {
    question: "What are AI prompt templates?",
    answer: "AI prompt templates are reusable instructions for common ChatGPT, Claude, coding, research, marketing, and writing tasks, so you can start from a proven structure instead of a blank prompt.",
  },
  {
    question: "How does a prompt template tool help?",
    answer: "A prompt template tool helps you search, adapt, save, and reuse prompts across projects, keeping your strongest instructions easy to find when the same workflow comes back.",
  },
  {
    question: "What are prompt workflow templates?",
    answer: "Prompt workflow templates organize multi-step tasks such as research, review, editing, and implementation into repeatable prompts with clear context, output format, and quality checks.",
  },
  {
    question: "Can I use these templates with ChatGPT and Claude?",
    answer: "Yes. Promplify templates are written as reusable AI prompts, so you can adapt them for ChatGPT, Claude, Gemini, and other AI tools that support structured instructions.",
  },
  {
    question: "How should I choose a prompt template?",
    answer: "Start with the closest use case, then adjust the context, examples, tone, and output format for your task before saving the prompt to your own library.",
  },
];

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const requestIdRef = useRef(0);
  const latestQueryRef = useRef(debouncedSearchQuery);
  const searchSurfaceRef = useRef<Parameters<typeof trackTemplateSearch>[1]>("search_input");
  const lastTrackedSearchRef = useRef("");
  const navigate = useNavigate();
  const { ref, inView } = useInView({
    threshold: 0.5,
    delay: 100,
  });

  const fetchTemplates = useCallback(async (targetPage: number, queryValue: string) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const from = targetPage * PAGE_SIZE;
      const to = from + (PAGE_SIZE - 1);

      let query = supabase.from("prompt_template").select("*");

      if (queryValue) {
        query = query.or(`title.ilike.%${queryValue}%,system_prompt.ilike.%${queryValue}%,category.ilike.%${queryValue}%`);
      }

      const { data, error } = await query.range(from, to).order("created_at", { ascending: false });

      if (error) throw error;
      if (requestId !== requestIdRef.current) return;

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (targetPage === 0) {
        setTemplates(data);
      } else {
        setTemplates((prev) => [...prev, ...data]);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    latestQueryRef.current = debouncedSearchQuery;
    const query = debouncedSearchQuery.trim();
    if (!query) return;

    const surface = searchSurfaceRef.current;
    const trackingKey = `${surface}:${query}`;
    if (trackingKey !== lastTrackedSearchRef.current) {
      trackTemplateSearch(query, surface);
      lastTrackedSearchRef.current = trackingKey;
    }
    searchSurfaceRef.current = "search_input";
  }, [debouncedSearchQuery]);

  const applyTemplateSearch = (query: string, surface: Parameters<typeof trackTemplateSearch>[1]) => {
    searchSurfaceRef.current = surface;
    setSearchQuery(query);
  };

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setTemplates([]);
    fetchTemplates(0, debouncedSearchQuery);
  }, [debouncedSearchQuery, fetchTemplates]);

  useEffect(() => {
    if (page === 0) return;
    fetchTemplates(page, latestQueryRef.current);
  }, [page, fetchTemplates]);

  const handleUseTemplate = async (template: Template) => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user.id) {
        trackTemplateCtaClicked("create_library");
        toast.info("Create an account to save templates to your prompt workspace");
        navigate("/auth?mode=register");
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
      trackPromptCreated("template");
      trackTemplateUsed({
        source: "templates",
        templateId: template.id,
        category: template.category || "uncategorized",
      });
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
    <>
      <SEO
        canonicalPath="/templates/"
        title="AI Prompt Templates & Workflow Tool - Promplify"
        description="Browse AI prompt templates, find a prompt template tool for repeatable work, and build prompt workflow templates for ChatGPT, Claude, coding, research, and marketing."
        keywords="AI prompt templates, prompt library, prompt template tool, ChatGPT prompt templates, Claude prompt templates, prompt workflow templates, prompt optimization, AI workflow tools"
      />
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Navigation />

        <main className="flex-1 pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#2C106A]/5 text-[#2C106A] text-sm font-medium border border-[#2C106A]/10">
                <Sparkles className="w-4 h-4" />
                <span>AI prompt templates for repeatable workflows</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-5 text-gray-950">AI Prompt Templates for Repeatable Workflows</h1>
              <p className="text-gray-600 text-base sm:text-lg mb-6 font-medium max-w-3xl mx-auto">
                Find reusable AI prompt templates for ChatGPT, Claude, coding, research, and marketing. Use Promplify as your prompt template tool to turn strong instructions into prompt workflow templates you can save, reuse, and connect to your apps.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  onClick={() => {
                    trackTemplateCtaClicked("create_library");
                    navigate("/auth?mode=register");
                  }}
                  className="w-full sm:w-auto bg-[#2C106A] hover:bg-[#1F0B4C] text-white"
                >
                  Start building prompts
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    trackTemplateCtaClicked("discover");
                    navigate("/discover/");
                  }}
                  className="w-full sm:w-auto"
                >
                  Explore community prompts
                </Button>
              </div>
            </div>

            {/* Search Section */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2C106A] to-purple-600 rounded-full blur-md opacity-25 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm transition-shadow group-hover:shadow-md">
                  <div className="flex-none pl-5">
                    {searchQuery.trim() !== debouncedSearchQuery ? (
                      <div className="w-5 h-5 border-2 border-[#2C106A] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <Input
                    type="text"
                    placeholder="Search templates by title, content, or category..."
                    value={searchQuery}
                    onChange={(e) => applyTemplateSearch(e.target.value, "search_input")}
                    className="flex-1 h-12 sm:h-14 px-3 sm:px-4 py-3 sm:py-4 bg-transparent border-0 focus:ring-0 focus:outline-none text-sm sm:text-base placeholder:text-gray-400"
                    style={{ boxShadow: "none" }}
                  />
                  {searchQuery && (
                    <button onClick={() => applyTemplateSearch("", "search_input")} className="flex-none pr-5 text-gray-400 hover:text-gray-600 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
              {searchQuery && !loading && templates.length === 0 && <div className="text-center mt-4 text-sm text-gray-500">No templates found for "{searchQuery}"</div>}
            </div>
            <div className="max-w-3xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-2">
              {templateQuickFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => applyTemplateSearch(filter, "quick_filter")}
                  className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-600 hover:border-[#2C106A]/30 hover:text-[#2C106A] transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
            <section className="max-w-6xl mx-auto mb-10 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {templateUseCases.map(({ title, description, filter, Icon }) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => applyTemplateSearch(filter, "use_case")}
                    className="text-left bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-[#2C106A]/30 hover:shadow-md transition-all"
                  >
                    <Icon className="w-5 h-5 text-[#2C106A] mb-3" />
                    <h2 className="text-base font-semibold text-gray-950 mb-2">{title}</h2>
                    <p className="text-sm leading-6 text-gray-600">{description}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {workflowLinks.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    onClick={() => trackTemplateCtaClicked(item.target as Parameters<typeof trackTemplateCtaClicked>[0])}
                    className="group bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-[#2C106A]/30 hover:shadow-md transition-all"
                  >
                    <Workflow className="w-5 h-5 text-gray-500 group-hover:text-[#2C106A] mb-3 transition-colors" />
                    <h2 className="text-base font-semibold text-gray-950 mb-2">{item.title}</h2>
                    <p className="text-sm leading-6 text-gray-600 mb-3">{item.description}</p>
                    <span className="inline-flex items-center text-sm font-medium text-[#2C106A]">
                      {item.cta}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </span>
                  </Link>
                ))}
              </div>
              <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                <article className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <PenTool className="w-5 h-5 text-[#2C106A] mb-3" />
                  <h2 className="text-lg font-semibold text-gray-950 mb-2">Use Promplify as your prompt template tool</h2>
                  <p className="text-sm leading-6 text-gray-600 mb-4">
                    Search proven AI prompt templates, adapt them for your task, and keep your strongest instructions organized for the next time you need them.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Prompt library", "Prompt optimization", "Team workflows", "API-ready prompts"].map((label) => (
                      <span key={label} className="rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                        {label}
                      </span>
                    ))}
                  </div>
                </article>
                <article className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <HelpCircle className="w-5 h-5 text-[#2C106A] mb-3" />
                  <h2 className="text-lg font-semibold text-gray-950 mb-2">Popular prompt template searches</h2>
                  <div className="flex flex-wrap gap-2">
                    {["AI prompt templates", "prompt workflow templates", "prompt template tool", "ChatGPT prompts", "Claude prompts", "coding prompts"].map((label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => applyTemplateSearch(label, "popular_search")}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#2C106A]/30 hover:text-[#2C106A] transition-colors"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </article>
              </div>
              <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-950 mb-4">Find the right prompt template faster</h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {longTailSearches.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => applyTemplateSearch(item.query, "long_tail")}
                      className="text-left rounded-lg border border-gray-100 bg-gray-50 p-4 hover:border-[#2C106A]/30 hover:bg-white transition-colors"
                    >
                      <h3 className="text-base font-semibold text-gray-950 mb-2">{item.title}</h3>
                      <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                    </button>
                  ))}
                </div>
              </section>
              <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-950 mb-4">Prompt Template FAQ</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {faqItems.map((item) => (
                    <article key={item.question} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                      <h3 className="text-base font-semibold text-gray-950 mb-2">{item.question}</h3>
                      <p className="text-sm leading-6 text-gray-600">{item.answer}</p>
                    </article>
                  ))}
                </div>
              </section>
            </section>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-500 mb-10">
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
            <div className="max-w-6xl mx-auto space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group relative bg-white border border-gray-200 hover:border-[#2C106A]/20 rounded-lg p-5 transition-all duration-300 hover:shadow-md cursor-pointer"
                  onClick={() => {
                    trackTemplateOpened({ templateId: template.id, category: template.category });
                    navigate(`/template/${template.id}`);
                  }}
                >
                  {/* Header Section with Title and Actions */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-3 line-clamp-1 group-hover:text-[#2C106A] transition-colors">{template.title}</h3>
                      <div className="flex items-center flex-wrap gap-2.5 text-sm">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-purple-50 to-purple-50/50 text-purple-700 border border-purple-100/80 shadow-sm shadow-purple-100/50">
                          <span className="font-semibold">{countTokens(template.system_prompt)}</span>
                          <span className="ml-1 text-purple-500 font-medium">tokens</span>
                        </div>
                        {template.category && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-200"></span>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-[#2C106A]/5 to-purple-50/30 text-[#2C106A] border border-[#2C106A]/10 shadow-sm shadow-purple-100/30">
                              <Tag className="w-3.5 h-3.5 mr-1.5 stroke-[2.5] opacity-80" />
                              <span className="font-medium">{template.category}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleUseTemplate(template)}
                        className="bg-[#2C106A] hover:bg-[#2C106A]/90 text-white font-medium shadow-sm hover:shadow transition-all duration-200 px-5 h-9 rounded-md whitespace-nowrap"
                      >
                        <span className="flex items-center gap-1.5">
                          Use Template
                          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Prompt Content */}
                  <div className="relative">
                    <div className="font-mono text-xs sm:text-sm text-gray-600 bg-gray-50/70 px-3 sm:px-5 py-3 sm:py-4 rounded-md border border-gray-200/80 min-h-[100px] sm:h-32 overflow-hidden">
                      <div className="leading-relaxed whitespace-pre-wrap line-clamp-3 sm:line-clamp-4">{template.system_prompt}</div>
                      <div className="absolute inset-x-0 bottom-0 h-12 sm:h-16 bg-gradient-to-t from-gray-50 via-gray-50/95 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
                </div>
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
    </>
  );
}
