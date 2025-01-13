import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { addTagToPrompt, createPrompt, createTag, deletePrompt, getCategories, getPromptById, getTags, updatePrompt } from "@/services/promptService";
import { Category, Prompt, Tag } from "@/types/prompt";
import { AlertCircle, ChevronDown, ChevronUp, Copy, Gauge, Plus, Sparkles, Trash2, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const formatId = (id?: string | null) => {
  if (!id) return "";
  // 将 UUID 转换为大写字母+数字的 hash 形式
  return id
    .replace(/-/g, "")
    .slice(0, 15)
    .split("")
    .map((char) => (Math.random() > 0.5 ? char.toUpperCase() : char))
    .join("");
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

  useEffect(() => {
    const loadPrompt = async () => {
      if (!promptId) return;

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
    if (prompt.content) {
      navigator.clipboard.writeText(prompt.content);
      toast.success("Content copied to clipboard");
    }
  };

  const handleSave = async () => {
    if (!prompt.title || !prompt.content) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user.id) {
        toast.error("Please login to save prompts");
        return;
      }

      const promptData = {
        ...prompt,
        user_id: session.data.session.user.id,
      };

      if (promptId) {
        await updatePrompt(promptId, promptData);
        toast.success("Prompt updated successfully");
      } else {
        const newPrompt = await createPrompt(promptData);
        toast.success("Prompt created successfully");
      }
      onSave?.();
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
      // TODO: Handle navigation after deletion
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast.error("Failed to delete prompt");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
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
          <span className="text-sm text-gray-500">Version {prompt.version}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm text-gray-500">
            <b className="text-primary">#</b>
            {formatId(promptId)}
          </span>
          <Button variant="outline" size="sm" onClick={handleCopyContent}>
            <Copy size={16} className="mr-1.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)} disabled={!promptId || isDeleting}>
            <Trash2 size={16} className="mr-1.5" />
            Delete
          </Button>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">Required</span>
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
                      onChange={(e) => setPrompt({ ...prompt, version: e.target.value })}
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
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            const selectedTag = availableTags.find((t) => t.id === e.target.value);
                            if (selectedTag) {
                              setPrompt({
                                ...prompt,
                                prompt_tags: [...(prompt.prompt_tags || []), { tags: { id: selectedTag.id, name: selectedTag.name } }],
                              });
                            }
                          }
                        }}
                      >
                        <option value="">Select a tag</option>
                        {availableTags
                          .filter((tag) => !prompt.prompt_tags?.some((pt) => pt.tags.id === tag.id))
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                      </select>
                      <div className="flex gap-2">
                        <Input type="text" placeholder="New tag" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleAddTag()} className="w-32" />
                        <Button onClick={handleAddTag} variant="outline" size="icon">
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {prompt.prompt_tags?.map(({ tags }) => (
                        <span
                          key={tags.id}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full flex items-center group hover:bg-blue-100"
                          onClick={() => {
                            setPrompt({
                              ...prompt,
                              prompt_tags: prompt.prompt_tags?.filter((pt) => pt.tags.id !== tags.id),
                            });
                          }}
                        >
                          {tags.name}
                          <X size={12} className="ml-1 opacity-0 group-hover:opacity-100 cursor-pointer" />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Model Configuration */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-medium text-gray-900">Model Configuration</h3>
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
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Temperature</label>
                          <Sparkles size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          placeholder="0.7"
                          value={prompt.temperature}
                          onChange={(e) => setPrompt({ ...prompt, temperature: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Max Tokens</label>
                          <Zap size={14} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          min="1"
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          placeholder="2000"
                          value={prompt.max_tokens}
                          onChange={(e) => setPrompt({ ...prompt, max_tokens: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <Gauge size={14} className="text-gray-400" />
                        </div>
                        <select
                          className="w-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300"
                          value={prompt.model}
                          onChange={(e) => setPrompt({ ...prompt, model: e.target.value })}
                        >
                          <option value="gpt-4">GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="claude-2">Claude 2</option>
                        </select>
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
                    <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">Required</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle size={14} className="mr-1" />
                    Supports Markdown format
                  </div>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  className="w-full h-full px-3 py-2 bg-white border border-gray-200 focus:ring-[#2C106A] focus:border-[#2C106A] hover:border-gray-300 font-mono resize-none"
                  placeholder="Enter prompt content"
                  style={{ minHeight: "300px" }}
                  value={prompt.content}
                  onChange={(e) => setPrompt({ ...prompt, content: e.target.value })}
                />
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
