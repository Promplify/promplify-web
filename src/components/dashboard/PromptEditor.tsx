import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { addTagToPrompt, createPrompt, createTag, deletePrompt, getCategories, getPromptById, getTags, updatePrompt } from "@/services/promptService";
import { Category, Prompt, Tag } from "@/types/prompt";
import { countTokens } from "gpt-tokenizer/model/gpt-4";
import { AlertCircle, ChevronDown, ChevronUp, Copy, Gauge, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

type SimplifiedTag = {
  id: string;
  name: string;
};

type PromptTag = {
  tags: SimplifiedTag;
};

type PromptWithTags = Prompt & {
  prompt_tags?: { tags: Omit<Tag, "created_at"> }[];
};

interface PromptEditorProps {
  promptId?: string | null;
  onSave?: () => void;
}

const validateVersion = (version: string) => {
  const pattern = /^\d+\.\d+\.\d+$/;
  return pattern.test(version);
};

export function PromptEditor({ promptId, onSave }: PromptEditorProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [newTag, setNewTag] = useState("");
  const [prompt, setPrompt] = useState<Prompt>({
    title: "",
    description: "",
    content: "",
    version: "1.0.0",
    token_count: 0,
    is_favorite: false,
    model: "gpt-4",
    temperature: 0.7,
    max_tokens: 2000,
    prompt_tags: [],
  } as Prompt);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const loadPrompt = async () => {
      if (!promptId) {
        // 当 promptId 为空时,重置表单为默认值
        setPrompt({
          id: "",
          user_id: "",
          title: "",
          description: "",
          content: "",
          system_prompt: "",
          user_prompt: "",
          version: "1.0.0",
          token_count: 0,
          performance: 0,
          is_favorite: false,
          category_id: "",
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 2000,
          prompt_tags: [],
        } as Prompt);
        return;
      }

      if (promptId === "new") {
        // 如果是新建,也使用默认值
        setPrompt({
          id: "",
          user_id: "",
          title: "",
          description: "",
          content: "",
          system_prompt: "",
          user_prompt: "",
          version: "1.0.0",
          token_count: 0,
          performance: 0,
          is_favorite: false,
          category_id: "",
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 2000,
          prompt_tags: [],
        } as Prompt);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getPromptById(promptId);
        setPrompt(data);
      } catch (error) {
        console.error("Error loading prompt:", error);
        toast.error("Failed to load prompt");
      } finally {
        setIsLoading(false);
      }
    };

    const loadTags = async () => {
      try {
        const tags = await getTags();
        setAvailableTags(tags);
      } catch (error) {
        console.error("Error loading tags:", error);
        toast.error("Failed to load tags");
      }
    };

    const loadCategories = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user.id) {
          const categories = await getCategories(session.data.session.user.id);
          setAvailableCategories(categories);
          if (!promptId && !prompt.category_id && categories.length > 0) {
            setPrompt((prev) => ({ ...prev, category_id: categories[0].id }));
          }
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        toast.error("Failed to load categories");
      }
    };

    loadPrompt();
    loadTags();
    loadCategories();
  }, [promptId]);

  const handleCopyContent = () => {
    const combinedPrompt = `System: ${prompt.system_prompt}\n\nUser: ${prompt.user_prompt}`;
    navigator.clipboard.writeText(combinedPrompt);
    toast.success("Content copied to clipboard");
  };

  const handleSave = async () => {
    if (!prompt.title || !prompt.system_prompt) {
      toast.error("Title and system prompt are required");
      return;
    }

    try {
      setIsSaving(true);
      // 重新计算一次 tokens 确保数据最新
      const systemTokens = countTokens(prompt.system_prompt || "");
      const userTokens = countTokens(prompt.user_prompt || "");
      const totalTokens = systemTokens + userTokens;

      const promptData = {
        ...prompt,
        id: promptId === "new" ? uuidv4() : prompt.id || uuidv4(),
        user_id: session?.user?.id,
        token_count: totalTokens,
        system_tokens: systemTokens,
        user_tokens: userTokens,
      };

      if (!promptData.id) {
        toast.error("Failed to generate ID");
        return;
      }

      if (promptId === "new") {
        await createPrompt(promptData);
        toast.success("Prompt created successfully");
        onSave?.();
      } else {
        await updatePrompt(promptId, promptData);
        toast.success("Prompt updated successfully");
      }
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast.error("Failed to save prompt");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!promptId) return;

    setIsDeleting(true);
    try {
      await deletePrompt(promptId);
      toast.success("Prompt deleted successfully");
      onSave?.();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Failed to delete prompt");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const tag = await createTag(newTag.trim());
      if (promptId) {
        await addTagToPrompt(promptId, tag.id);
      }
      setAvailableTags([...availableTags, tag]);
      setNewTag("");
      toast.success("Tag added successfully");
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Failed to add tag");
    }
  };

  const createOrUpdatePrompt = async (promptData: Prompt) => {
    if (promptId) {
      await updatePrompt(promptId, promptData);
    } else {
      await createPrompt(promptData);
    }
  };

  const calculateTokens = () => {
    const systemTokens = countTokens(prompt.system_prompt || "");
    const userTokens = countTokens(prompt.user_prompt || "");
    const totalTokens = systemTokens + userTokens;

    setPrompt((prev) => ({
      ...prev,
      token_count: totalTokens,
      system_tokens: systemTokens,
      user_tokens: userTokens,
    }));
  };

  useEffect(() => {
    calculateTokens();
  }, [prompt.system_prompt, prompt.user_prompt]);

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gray-50 flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="font-medium">{prompt.title || "New Prompt"}</h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-purple-100 text-purple-800">Version {prompt.version}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">Tokens: {prompt.token_count}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm text-gray-500">
            <b className="text-primary">#</b>
            {promptId === "new" ? "NEW" : promptId?.toUpperCase()}
          </span>
          <Button variant="outline" size="sm" onClick={handleCopyContent}>
            <Copy size={16} className="mr-1" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={!promptId || isDeleting}>
            <Trash2 size={16} className="mr-1" />
            Delete
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[100px]">
            <Save size={16} className="mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-2">
          <div className="space-y-4">
            {/* Basic Information */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Basic Information</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-purple-100 text-purple-800">Required</span>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                      placeholder="Enter prompt title"
                      value={prompt.title}
                      onChange={(e) => setPrompt({ ...prompt, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                      placeholder="e.g., 1.0.0"
                      value={prompt.version}
                      onChange={(e) => {
                        const newVersion = e.target.value;
                        if (newVersion === "" || validateVersion(newVersion)) {
                          setPrompt({ ...prompt, version: newVersion });
                        }
                      }}
                      onBlur={() => {
                        if (!validateVersion(prompt.version)) {
                          setPrompt({ ...prompt, version: "1.0.0" });
                          toast.error("Invalid version format. Reset to 1.0.0");
                        }
                      }}
                    />
                    <p className="mt-1 text-sm text-gray-500">Semantic versioning (major.minor.patch)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                    placeholder="Briefly describe the purpose of this prompt"
                    value={prompt.description}
                    onChange={(e) => setPrompt({ ...prompt, description: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* Classification */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Classification</h3>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-800">Optional</span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                      value={prompt.category_id || ""}
                      onChange={(e) => setPrompt({ ...prompt, category_id: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="Type to search or create tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter" && newTag.trim()) {
                              e.preventDefault();
                              const trimmedTag = newTag.trim();
                              const existingTag = availableTags.find((tag) => tag.name.toLowerCase() === trimmedTag.toLowerCase());

                              try {
                                if (existingTag) {
                                  if (!prompt.prompt_tags?.some((pt) => pt.tags.id === existingTag.id)) {
                                    setPrompt({
                                      ...prompt,
                                      prompt_tags: [...(prompt.prompt_tags || []), { tags: existingTag }],
                                    });
                                    toast.success(`Added tag: ${existingTag.name}`);
                                  } else {
                                    toast.error("Tag already added");
                                  }
                                } else {
                                  const newTagObj = await createTag(trimmedTag);
                                  setAvailableTags([...availableTags, newTagObj]);
                                  setPrompt({
                                    ...prompt,
                                    prompt_tags: [...(prompt.prompt_tags || []), { tags: newTagObj }],
                                  });
                                  toast.success(`Created and added tag: ${trimmedTag}`);
                                }
                                setNewTag("");
                              } catch (error) {
                                console.error("Error handling tag:", error);
                                toast.error("Failed to handle tag");
                              }
                            }
                          }}
                          className="w-full"
                        />
                        {newTag && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                            {availableTags
                              .filter((tag) => tag.name.toLowerCase().includes(newTag.toLowerCase()) && !prompt.prompt_tags?.some((pt) => pt.tags.id === tag.id))
                              .map((tag) => (
                                <button
                                  key={tag.id}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between group"
                                  onClick={() => {
                                    setPrompt({
                                      ...prompt,
                                      prompt_tags: [...(prompt.prompt_tags || []), { tags: tag }],
                                    });
                                    setNewTag("");
                                    toast.success(`Added tag: ${tag.name}`);
                                  }}
                                >
                                  <span>{tag.name}</span>
                                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">Click to add</span>
                                </button>
                              ))}
                            {newTag.trim() && !availableTags.some((tag) => tag.name.toLowerCase() === newTag.trim().toLowerCase()) && (
                              <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between text-blue-600 group"
                                onClick={async () => {
                                  try {
                                    const newTagObj = await createTag(newTag.trim());
                                    setAvailableTags([...availableTags, newTagObj]);
                                    setPrompt({
                                      ...prompt,
                                      prompt_tags: [...(prompt.prompt_tags || []), { tags: newTagObj }],
                                    });
                                    setNewTag("");
                                    toast.success(`Created and added tag: ${newTag.trim()}`);
                                  } catch (error) {
                                    console.error("Error creating tag:", error);
                                    toast.error("Failed to create tag");
                                  }
                                }}
                              >
                                <span>Create tag "{newTag.trim()}"</span>
                                <span className="text-xs opacity-0 group-hover:opacity-100">Press Enter</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prompt.prompt_tags?.map(({ tags }) => (
                          <span key={tags.id} className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full group">
                            {tags.name}
                            <button
                              onClick={() => {
                                setPrompt({
                                  ...prompt,
                                  prompt_tags: prompt.prompt_tags?.filter((pt) => pt.tags.id !== tags.id),
                                });
                                toast.success(`Removed tag: ${tags.name}`);
                              }}
                              className="ml-1.5 p-0.5 rounded-full hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Model Configuration */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium text-gray-900">Model Configuration</h3>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-purple-100 text-purple-800">Advanced</span>
                </div>
              </div>
              <div>
                <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-2">
                    <Gauge size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Configure model parameters</span>
                  </div>
                  {showAdvanced ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {showAdvanced && (
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                        <div className="relative">
                          <input
                            list="model-options"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                            value={prompt.model || ""}
                            onChange={(e) => setPrompt({ ...prompt, model: e.target.value })}
                            placeholder="Select or enter model"
                          />
                          <datalist id="model-options">
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            <option value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16K</option>
                            <option value="claude-2">Claude 2</option>
                            <option value="claude-instant">Claude Instant</option>
                            <option value="gemini-pro">Gemini Pro</option>
                            <option value="llama-2">Llama 2</option>
                            <option value="mistral">Mistral</option>
                            <option value="mixtral">Mixtral</option>
                          </datalist>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={prompt.temperature}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (value >= 0 && value <= 1) {
                                setPrompt({ ...prompt, temperature: value });
                              }
                            }}
                            step="0.1"
                            min="0"
                            max="1"
                            className="w-20 px-2 py-1 bg-white border border-gray-200 rounded-md focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          />
                          <span className="text-sm text-gray-500">{prompt.temperature === 0 ? "More precise" : prompt.temperature === 1 ? "More creative" : "Balanced"}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Controls randomness (0 = precise, 1 = creative)</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <div className="flex items-center justify-between">
                            <span>Max Tokens</span>
                            <span className="text-xs text-gray-500">{prompt.max_tokens}</span>
                          </div>
                        </label>
                        <input
                          type="number"
                          value={prompt.max_tokens}
                          onChange={(e) => setPrompt({ ...prompt, max_tokens: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          min="1"
                          max="32000"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Content */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium text-gray-900">Content</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">
                      System: {prompt.system_tokens || 0} + User: {prompt.user_tokens || 0} = {prompt.token_count} tokens
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle size={14} className="mr-1" />
                    Supports Markdown format
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  <div>
                    <Label>System Prompt</Label>
                    <Textarea value={prompt.system_prompt} onChange={(e) => setPrompt({ ...prompt, system_prompt: e.target.value })} placeholder="Enter system prompt..." className="h-32 font-mono" />
                  </div>
                  <div>
                    <Label>User Prompt</Label>
                    <Textarea value={prompt.user_prompt} onChange={(e) => setPrompt({ ...prompt, user_prompt: e.target.value })} placeholder="Enter user prompt..." className="h-32 font-mono" />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the prompt and all its associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
