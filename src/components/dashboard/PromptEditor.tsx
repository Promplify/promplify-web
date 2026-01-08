import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { sharePromptToDiscover } from "@/services/plazaService";
import { addTagToPrompt, createPrompt, createTag, deletePrompt, getCategories, getPromptById, getTags, optimizeSystemPrompt, updatePrompt } from "@/services/promptService";
import { createShareLink } from "@/services/shareService";
import { Category, Prompt, Tag } from "@/types/prompt";
import { countTokens } from "gpt-tokenizer/model/gpt-4";
import { AlertCircle, Copy, ExternalLink, Save, Share2, Trash2, X } from "lucide-react";
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

type PromptVersion = {
  version: string;
  content: string;
  system_prompt: string;
  user_prompt: string;
  token_count: number;
  created_at: string;
};

interface PromptEditorProps {
  promptId?: string | null;
  onSave?: (savedPromptId?: string) => void;
  onDelete?: () => void;
}

const validateVersion = (version: string) => {
  const pattern = /^\d+\.\d+\.\d+$/;
  return pattern.test(version);
};

export function PromptEditor({ promptId, onSave, onDelete }: PromptEditorProps) {
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
    category_id: null,
    system_prompt: "",
    user_prompt: "",
  } as Prompt);
  const [session, setSession] = useState<any>(null);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<PromptVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [previousSystemPrompt, setPreviousSystemPrompt] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [isSharing, setIsSharing] = useState(false);
  const [isSharingToDiscover, setIsSharingToDiscover] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
          toast.error("Session error, please try logging in again");
          return;
        }
        setSession(currentSession);
      } catch (error) {
        console.error("Error getting session:", error);
        toast.error("Session error, please try logging in again");
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session?.user.id) {
          console.error("No user session");
          return;
        }

        const userId = session.data.session.user.id;
        try {
          const categories = await getCategories(userId);
          setAvailableCategories(categories || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setAvailableCategories([]);
        }
      } catch (error) {
        console.error("Error in loadCategories:", error);
        toast.error("Failed to load categories");
      }
    };

    loadCategories();
  }, [session?.user?.id]);

  useEffect(() => {
    const loadPrompt = async () => {
      if (!promptId) {
        setPrompt((prev) => ({
          ...prev,
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
          category_id: null,
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 2000,
          prompt_tags: [],
        }));
        return;
      }

      if (promptId === "new") {
        const session = await supabase.auth.getSession();
        if (!session.data.session?.user.id) {
          toast.error("Please login first");
          return;
        }

        setPrompt((prev) => ({
          ...prev,
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
          category_id: availableCategories.length > 0 ? availableCategories[0].id : null,
          model: "gpt-4",
          temperature: 0.7,
          max_tokens: 2000,
          prompt_tags: [],
        }));
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

    loadPrompt();
    loadTags();
  }, [promptId, availableCategories]);

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

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();
    if (!currentSession?.user?.id) {
      toast.error("Please login to save prompt");
      return;
    }

    try {
      setIsSaving(true);
      const systemTokens = countTokens(prompt.system_prompt || "");
      const userTokens = countTokens(prompt.user_prompt || "");
      const totalTokens = systemTokens + userTokens;

      if (promptId && promptId !== "new") {
        const { data: currentPrompt } = await supabase.from("prompts").select("system_prompt, user_prompt, version").eq("id", promptId).single();

        const contentChanged = currentPrompt && (currentPrompt.system_prompt !== prompt.system_prompt || currentPrompt.user_prompt !== prompt.user_prompt);

        if (contentChanged && currentPrompt?.version === prompt.version) {
          const [major, minor, patch] = prompt.version.split(".").map(Number);
          prompt.version = `${major}.${minor}.${patch + 1}`;
          setPrompt((prev) => ({ ...prev, version: prompt.version }));
          toast.info(`Content changed, version automatically incremented to ${prompt.version}`);
        }

        if (currentPrompt?.version !== prompt.version) {
          const { data: existingVersions } = await supabase.from("prompt_versions").select("version").eq("prompt_id", promptId);

          const versions = existingVersions?.map((v) => v.version) || [];
          if (versions.includes(prompt.version)) {
            const [major, minor, patch] = prompt.version.split(".").map(Number);
            let newPatch = patch;
            let newVersion;
            do {
              newPatch++;
              newVersion = `${major}.${minor}.${newPatch}`;
            } while (versions.includes(newVersion));

            setPrompt((prev) => ({ ...prev, version: newVersion }));
            toast.info(`Version ${prompt.version} already exists, automatically incremented to ${newVersion}`);
            prompt.version = newVersion;
          }
        }

        if (currentPrompt?.version !== prompt.version) {
          const { error: versionError } = await supabase.from("prompt_versions").insert({
            prompt_id: promptId,
            version: currentPrompt?.version,
            content: prompt.content,
            system_prompt: currentPrompt?.system_prompt,
            user_prompt: currentPrompt?.user_prompt,
            token_count: totalTokens,
            created_by: currentSession.user.id,
          });

          if (versionError) throw versionError;
        }
      }

      const promptData = {
        ...prompt,
        id: promptId === "new" ? uuidv4() : promptId,
        user_id: currentSession.user.id,
        token_count: totalTokens,
        system_tokens: systemTokens,
        user_tokens: userTokens,
        category_id: prompt.category_id || null,
        performance: prompt.performance || 0,
      };

      if (promptId === "new") {
        const newPrompt = await createPrompt(promptData);
        toast.success("Prompt created successfully");
        onSave?.(newPrompt.id);
      } else {
        const { id, created_at, updated_at, ...updateData } = promptData;
        await updatePrompt(promptId, updateData);
        toast.success("Prompt updated successfully");
        onSave?.(promptId);
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

    try {
      setIsDeleting(true);
      await deletePrompt(promptId);
      toast.success("Prompt deleted successfully");
      onDelete?.();
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

  const renderCategorySelect = () => (
    <Select
      value={prompt.category_id || "none"}
      onValueChange={(value) => {
        const newCategoryId = value === "none" ? null : value;
        setPrompt((prev) => ({ ...prev, category_id: newCategoryId }));
      }}
    >
      <SelectTrigger className="w-full hover:border-gray-300">
        <SelectValue placeholder="All Prompts" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">All Prompts</SelectItem>
        {availableCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const fetchVersionHistory = async () => {
    if (!promptId || promptId === "new") return;

    setIsLoadingVersions(true);
    try {
      const { data, error } = await supabase.rpc("get_prompt_versions", { p_prompt_id: promptId });

      if (error) throw error;
      setVersionHistory(data || []);
    } catch (error) {
      console.error("Error fetching version history:", error);
      toast.error("Failed to load version history");
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const restoreVersion = (version: PromptVersion) => {
    setPrompt((prev) => ({
      ...prev,
      content: version.content,
      system_prompt: version.system_prompt,
      user_prompt: version.user_prompt,
    }));
    setShowVersionHistory(false);
    toast.success("Version restored");
  };

  const handleOpenInChatGPT = () => {
    const content = `${prompt.system_prompt ? prompt.system_prompt + "\n\n" : ""}${prompt.user_prompt}`;
    const maxLength = 2000; // Set a safe URL length limit

    if (encodeURIComponent(content).length > maxLength) {
      // If content is too long, can send partial content or prompt user
      const truncatedContent = content.slice(0, maxLength);
      window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(truncatedContent)}...`, "_blank");
      toast.error("Prompt content was truncated due to length limitations");
    } else {
      window.open(`https://chat.openai.com/?prompt=${encodeURIComponent(content)}`, "_blank");
    }
  };

  const handleOpenInClaude = () => {
    const content = `${prompt.system_prompt ? prompt.system_prompt + "\n\n" : ""}${prompt.user_prompt}`;
    const maxLength = 2000; // Set a safe URL length limit

    if (encodeURIComponent(content).length > maxLength) {
      // If content is too long, can send partial content or prompt user
      const truncatedContent = content.slice(0, maxLength);
      window.open(`https://claude.ai/new?q=${encodeURIComponent(truncatedContent)}...`, "_blank");
      toast.error("Prompt content was truncated due to length limitations");
    } else {
      window.open(`https://claude.ai/new?q=${encodeURIComponent(content)}`, "_blank");
    }
  };

  const handleOptimizeSystemPrompt = async () => {
    if (!prompt.system_prompt) {
      toast.error("System prompt is empty");
      return;
    }

    try {
      setIsOptimizing(true);
      setPreviousSystemPrompt(prompt.system_prompt);

      const optimizedPrompt = await optimizeSystemPrompt(prompt.system_prompt);

      setPrompt((prev) => ({
        ...prev,
        system_prompt: optimizedPrompt,
      }));

      toast.success("System prompt optimized successfully");
    } catch (error) {
      console.error("Error optimizing system prompt:", error);
      toast.error("Failed to optimize system prompt");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUndoOptimization = () => {
    if (previousSystemPrompt) {
      setPrompt((prev) => ({
        ...prev,
        system_prompt: previousSystemPrompt,
      }));
      setPreviousSystemPrompt(null);
      toast.success("Optimization undone");
    }
  };

  const renderSystemPromptSection = () => (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>System Prompt</Label>
        <div className="flex items-center space-x-2">
          {previousSystemPrompt && (
            <Button variant="outline" size="sm" onClick={handleUndoOptimization} className="h-7 px-2 text-xs focus-visible:ring-0 focus-visible:ring-offset-0">
              Undo Optimization
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeSystemPrompt}
            disabled={isOptimizing || !prompt.system_prompt}
            className="h-7 px-2 text-xs flex items-center gap-1 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 transition-all duration-200 shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            {isOptimizing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-purple-700">Optimizing...</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-600"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="text-purple-700 font-medium">AI Optimize</span>
              </>
            )}
          </Button>
        </div>
      </div>
      <Textarea
        value={prompt.system_prompt}
        onChange={(e) => setPrompt({ ...prompt, system_prompt: e.target.value })}
        placeholder="Enter system prompt..."
        className="h-64 font-mono resize-y min-h-[12rem] focus:border-[#2C106A] hover:border-gray-300 transition-colors"
      />
    </div>
  );

  const handleShare = async () => {
    if (!promptId || !session?.user?.id) return;

    try {
      setIsSharing(true);
      const { shareUrl } = await createShareLink(promptId, session.user.id);
      setShareUrl(shareUrl);
      setShowShareDialog(true);
    } catch (error) {
      console.error("Error sharing prompt:", error);
      toast.error("Failed to create share link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied to clipboard");
  };

  const handleShareToDiscover = async () => {
    if (!promptId || promptId === "new") return;

    try {
      setIsSharingToDiscover(true);
      await sharePromptToDiscover(promptId);
      toast.success("Successfully shared to Discover!");
    } catch (error: any) {
      console.error("Error sharing to discover:", error);
      if (error.message === "Prompt already shared to discover") {
        toast.error("This prompt is already shared to Discover");
      } else {
        toast.error("Sharing failed, please try again");
      }
    } finally {
      setIsSharingToDiscover(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full bg-gray-50 p-4">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <Skeleton className="h-8 w-1/4 mb-4 animate-pulse" />
            <Skeleton className="h-40 w-full mb-4 animate-pulse" />
            <Skeleton className="h-40 w-full animate-pulse" />
          </div>
          <div className="bg-white p-4 rounded-lg">
            <Skeleton className="h-8 w-1/3 mb-4 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full animate-pulse" />
              <Skeleton className="h-32 w-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add empty state when no prompt is selected
  if (!promptId) {
    return (
      <div className="flex-1 h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2 max-w-md mx-auto p-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="text-gray-500">Select a prompt from the list or create a new one to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gray-50 flex flex-col">
      <div className="p-2 sm:p-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 sm:justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <h2 className="font-medium text-sm sm:text-base truncate">{prompt.title || "New Prompt"}</h2>
          <div className="flex items-center space-x-1">
            <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1 h-auto"
                  onClick={() => {
                    fetchVersionHistory();
                  }}
                  disabled={!promptId || promptId === "new"}
                >
                  <div className="flex items-center gap-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-purple-200 text-purple-700">Version {prompt.version}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400 group-hover:text-gray-600 transition-colors"
                    >
                      <path d="M12 20v-6M6 20V10M18 20V4" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">View History</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Version History</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  {isLoadingVersions ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-20 bg-gray-200 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  ) : versionHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No version history available</div>
                  ) : (
                    <div className="space-y-6">
                      {versionHistory.map((version, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">v{version.version}</span>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-blue-100 text-blue-800">{version.token_count} tokens</span>
                                <time className="text-sm text-gray-500" dateTime={version.created_at}>
                                  {new Date(version.created_at).toLocaleString()}
                                </time>
                              </div>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => restoreVersion(version)} className="gap-1.5 text-gray-600 hover:text-gray-900 h-8 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="relative top-[-1px] mt-[7px]"
                              >
                                <path d="m3 2 1.3 12.4a2 2 0 0 0 2 1.6h11.4a2 2 0 0 0 2-1.6L21 2" />
                                <path d="M12 10v6" />
                                <path d="m8.7 12 3.3 3 3.3-3" />
                              </svg>
                              Restore this version
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {version.system_prompt && (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <Label className="text-xs font-medium text-gray-700">System Prompt</Label>
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-gray-100 text-gray-600">System</span>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md text-sm font-mono border border-gray-100">{version.system_prompt}</div>
                              </div>
                            )}
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs font-medium text-gray-700">User Prompt</Label>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-green-100 text-green-700">User</span>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-md text-sm font-mono border border-gray-100">{version.user_prompt}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <div className="w-px h-4 bg-gray-300 mx-2"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={!promptId || promptId === "new" || isDeleting}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 h-auto text-xs"
            >
              <Trash2 size={14} />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="group focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                <span className="hidden sm:inline">Try in AI</span>
                <span className="sm:hidden">AI</span>
                <ExternalLink className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleOpenInChatGPT} className="gap-2 cursor-pointer">
                <img src="/logo-model-chatgpt.png" alt="ChatGPT" className="w-4" />
                ChatGPT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenInClaude} className="gap-2 cursor-pointer">
                <img src="/logo-model-claude.png" alt="Claude" className="w-4" />
                Claude
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleCopyContent} className="group focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <Copy size={14} className="sm:mr-1" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={!promptId || promptId === "new" || isSharing || isSharingToDiscover} className="group focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                <Share2 size={14} className="sm:mr-1" />
                <span className="hidden sm:inline">{isSharing || isSharingToDiscover ? "Sharing..." : "Share"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare} disabled={!promptId || promptId === "new" || isSharing} className="gap-2 cursor-pointer">
                <Share2 size={16} />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShareToDiscover} disabled={!promptId || promptId === "new" || isSharingToDiscover} className="gap-2 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 10v12"></path>
                  <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                </svg>
                Share to Discover
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[70px] sm:min-w-[100px] text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
            <Save size={14} className="sm:mr-1" />
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the prompt and all its associated data.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" className="border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Prompt</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link" className="sr-only">
                Share Link
              </Label>
              <Input id="share-link" value={shareUrl} readOnly className="h-9" />
            </div>
            <Button size="sm" onClick={handleCopyShareLink}>
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy share link</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Anyone with this link will be able to view and save this prompt.</p>
        </DialogContent>
      </Dialog>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full px-2 sm:px-3 lg:px-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Basic Information */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#2C106A] to-purple-600 rounded-full"></div>
                    <h3 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Basic Information</h3>
                  </div>
                  <span className="font-mono text-sm text-gray-500 flex-1">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-300">
                        {promptId === "new" ? "NEW" : promptId?.toUpperCase()}
                      </span>
                      <div className="group relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-400 hover:text-gray-600 cursor-help"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                        <div className="absolute left-1/2 -translate-x-1/2 top-6 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          This ID can be used with the API to fetch prompt data
                          <div className="absolute -top-[4px] left-1/2 -translate-x-1/2 border-[4px] border-transparent border-b-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  </span>
                  <span className="text-xs text-gray-500">Required</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus-visible:outline-none focus:border-[#2C106A] hover:border-gray-300 transition-colors"
                      placeholder="Enter prompt title"
                      value={prompt.title}
                      onChange={(e) => setPrompt({ ...prompt, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus-visible:outline-none focus:border-[#2C106A] hover:border-gray-300 transition-colors"
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
                    <p className="mt-1 text-xs text-gray-500">Semantic versioning (major.minor.patch)</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus-visible:outline-none focus:border-[#2C106A] hover:border-gray-300 transition-colors"
                    placeholder="Briefly describe the purpose of this prompt"
                    value={prompt.description}
                    onChange={(e) => setPrompt({ ...prompt, description: e.target.value })}
                  />
                </div>
              </div>
            </section>

            {/* Classification */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#2C106A] to-purple-600 rounded-full"></div>
                    <h3 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Classification</h3>
                  </div>
                  <span className="text-xs text-gray-500">Optional</span>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    {renderCategorySelect()}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <input
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
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus-visible:outline-none focus:border-[#2C106A] hover:border-gray-300 transition-colors"
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
                          <div key={tags.id} className="inline-flex items-center px-2.5 py-1 border border-green-200 text-green-700 text-xs font-medium rounded-full relative group/tag">
                            <span>{tags.name}</span>
                            <button
                              onClick={() => {
                                setPrompt({
                                  ...prompt,
                                  prompt_tags: prompt.prompt_tags?.filter((pt) => pt.tags.id !== tags.id),
                                });
                                toast.success(`Removed tag: ${tags.name}`);
                              }}
                              className="ml-1.5 w-3.5 h-3.5 rounded-full inline-flex items-center justify-center hover:bg-green-100 absolute -right-1 -top-1 bg-white shadow-sm border border-green-200 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                            >
                              <X size={10} className="text-green-700" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Content */}
            <section className="bg-white border-b border-gray-200">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-[#2C106A] to-purple-600 rounded-full"></div>
                    <h3 className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Content</h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200 text-blue-700">
                      System: {prompt.system_tokens || 0} + User: {prompt.user_tokens || 0} = {prompt.token_count} tokens
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <AlertCircle size={14} className="mr-1" />
                    Supports XML/Markdown format
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {renderSystemPromptSection()}
                  <div>
                    <Label>User Prompt</Label>
                    <Textarea
                      value={prompt.user_prompt}
                      onChange={(e) => setPrompt({ ...prompt, user_prompt: e.target.value })}
                      placeholder="Enter user prompt..."
                      className="h-64 font-mono resize-y min-h-[12rem] focus:border-[#2C106A] hover:border-gray-300 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
