import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { createCategory, deleteCategory, getCategories } from "@/services/promptService";
import { Category } from "@/types/prompt";
import { ChevronLeft, ChevronRight, LayoutGrid, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export function Sidebar({ onCategorySelect, selectedCategoryId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [totalPromptsCount, setTotalPromptsCount] = useState(0);

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user.id) {
          const { count } = await supabase.from("prompts").select("*", { count: "exact", head: true }).eq("user_id", session.data.session.user.id);
          setTotalPromptsCount(count || 0);
        } else {
          setTotalPromptsCount(0);
        }
      } catch (error) {
        console.error("Error fetching total prompt count:", error);
        setTotalPromptsCount(0);
      }
    };
    fetchTotalCount();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user.id) {
          const data = await getCategories(session.data.session.user.id);
          setCategories(data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId: string | null) => {
    onCategorySelect?.(categoryId);
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleDeleteCategory = async (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user.id) throw new Error("User not logged in");
      const userId = session.data.session.user.id;

      const targetCategory = categories.find((c) => c.id !== categoryToDelete);
      const isLastCategory = categories.length === 1;

      // If this is the last category, we need to handle prompts differently
      if (isLastCategory) {
        // Set category_id to null for all prompts in this category
        const { data: promptsToMove, error: selectError } = await supabase.from("prompts").select("id").eq("user_id", userId).eq("category_id", categoryToDelete);

        if (selectError) throw selectError;

        if (promptsToMove && promptsToMove.length > 0) {
          const updates = promptsToMove.map((p) => supabase.from("prompts").update({ category_id: null }).match({ id: p.id }));
          await Promise.all(updates);
        }
      } else if (targetCategory) {
        // Move prompts to another category
        const { data: promptsToMove, error: selectError } = await supabase.from("prompts").select("id").eq("user_id", userId).eq("category_id", categoryToDelete);

        if (selectError) throw selectError;

        if (promptsToMove && promptsToMove.length > 0) {
          const updates = promptsToMove.map((p) => supabase.from("prompts").update({ category_id: targetCategory.id }).match({ id: p.id }));
          await Promise.all(updates);
        }
      } else {
        // This should not happen, but handle it gracefully
        toast.error("Cannot delete category: no target category available.");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }

      await deleteCategory(categoryToDelete);

      const updatedCategories = categories.filter((c) => c.id !== categoryToDelete);
      setCategories(updatedCategories);

      if (selectedCategoryId === categoryToDelete) {
        handleCategoryClick(null);
      }

      const { count } = await supabase.from("prompts").select("*", { count: "exact", head: true }).eq("user_id", userId);
      setTotalPromptsCount(count || 0);

      const successMessage = isLastCategory ? "Category deleted. Prompts moved to uncategorized." : "Category deleted and prompts moved.";
      toast.success(successMessage);
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(`Failed to delete category: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user.id) {
        toast.error("Please login to add categories");
        return;
      }
      const newCategoryData = { name: newCategoryName.trim(), user_id: session.data.session.user.id };
      const createdCategory = await createCategory(newCategoryData);
      setCategories([...categories, { ...createdCategory, prompt_count: 0 }]);
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  if (isLoading) {
    return (
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "w-[60px]" : "w-[280px]"}`}>
        <div className="w-full h-full bg-white/50 backdrop-blur-sm border-r border-gray-200/60 p-4 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded w-full"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-white/50 backdrop-blur-sm border-r border-gray-200/60 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[60px]" : "w-[280px]"}`}>
      <div className="p-2">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <LayoutGrid size={20} className="text-gray-600" />
              <h2 className="font-semibold text-lg text-gray-800">Categories</h2>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {!isCollapsed && (
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors rounded-lg">
                    <Plus size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Plus size={18} className="text-primary" />
                      Add New Category
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Category Name
                      </Label>
                      <Input
                        id="name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Enter category name"
                        className="focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full bg-primary hover:bg-primary/90">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" size="sm" onClick={toggleCollapse} className={`h-8 w-8 p-0 hover:bg-gray-100 transition-all duration-200 rounded-lg ${isCollapsed ? "ml-auto" : ""}`}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <button
            className={cn(
              "w-full text-left rounded-lg text-sm flex items-center group transition-all duration-200 relative",
              "hover:bg-gray-50 hover:shadow-sm",
              isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5",
              selectedCategoryId === null && "bg-primary/10 text-primary shadow-sm border border-primary/20"
            )}
            onClick={() => handleCategoryClick(null)}
            title={isCollapsed ? "All Prompts" : undefined}
          >
            {isCollapsed && selectedCategoryId === null && <div className="absolute left-0 top-0 w-1 h-full bg-primary rounded-l-md"></div>}
            <div className={cn("flex items-center flex-1 min-w-0", isCollapsed ? "justify-center" : "gap-3")}>
              <div
                className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                  selectedCategoryId === null ? "bg-primary text-white" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                )}
              >
                A
              </div>
              {!isCollapsed && (
                <>
                  <span className="truncate font-medium">All Prompts</span>
                  <span
                    className={cn(
                      "ml-auto text-xs px-2 py-1 rounded-full font-semibold transition-colors",
                      selectedCategoryId === null ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    )}
                  >
                    {totalPromptsCount}
                  </span>
                </>
              )}
            </div>
          </button>

          {categories.map((category) => (
            <div key={category.id} className="relative group">
              <div
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "w-full text-left rounded-lg text-sm flex items-center group transition-all duration-200 cursor-pointer relative",
                  "hover:bg-gray-50 hover:shadow-sm",
                  isCollapsed ? "px-3 py-2.5 justify-center" : "px-3 py-2.5",
                  selectedCategoryId === category.id && "bg-primary/10 text-primary shadow-sm border border-primary/20"
                )}
                title={isCollapsed ? category.name : undefined}
              >
                {isCollapsed && selectedCategoryId === category.id && <div className="absolute left-0 top-0 w-1 h-full bg-primary rounded-l-md"></div>}
                <div className={cn("flex items-center flex-1 min-w-0", isCollapsed ? "justify-center" : "gap-3")}>
                  <div
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-colors",
                      selectedCategoryId === category.id ? "bg-primary text-white" : "bg-gray-200 text-gray-600 group-hover:bg-gray-300"
                    )}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                  {!isCollapsed && (
                    <>
                      <span className="truncate flex-1 font-medium">{category.name}</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category.id);
                          }}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
                          title="Delete category"
                        >
                          <Trash2 size={12} />
                        </button>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-semibold transition-colors",
                            selectedCategoryId === category.id ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                          )}
                        >
                          {category.prompt_count || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) {
            setIsDeleting(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 size={18} className="text-red-600" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? All prompts in this category will be moved to the default category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
