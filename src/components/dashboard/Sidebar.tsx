import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { createCategory, deleteCategory, getCategories } from "@/services/promptService";
import { Category } from "@/types/prompt";
import { ChevronLeft, ChevronRight, Folder, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export function Sidebar({ onCategorySelect, selectedCategoryId }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      if (!targetCategory && categories.length > 1) {
        toast.error("Cannot delete the last category without a target category.");
        setIsDeleting(false);
        setShowDeleteDialog(false);
        return;
      }
      let promptsMoved = false;
      if (targetCategory) {
        const { data: promptsToMove, error: selectError } = await supabase.from("prompts").select("id").eq("user_id", userId).eq("category_id", categoryToDelete);

        if (selectError) throw selectError;

        if (promptsToMove && promptsToMove.length > 0) {
          const updates = promptsToMove.map((p) => supabase.from("prompts").update({ category_id: targetCategory.id }).match({ id: p.id }));
          await Promise.all(updates);
          promptsMoved = true;
        }
      }

      await deleteCategory(categoryToDelete);

      const updatedCategories = categories.filter((c) => c.id !== categoryToDelete);
      setCategories(updatedCategories);

      if (selectedCategoryId === categoryToDelete) {
        handleCategoryClick(null);
      }

      const { count } = await supabase.from("prompts").select("*", { count: "exact", head: true }).eq("user_id", userId);
      setTotalPromptsCount(count || 0);

      toast.success(`Category deleted ${promptsMoved ? "and prompts moved" : ""}.`);
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
      <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? "w-[60px]" : "w-[240px]"}`}>
        <div className="w-full h-full bg-gray-50 p-4 animate-pulse">
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
    <div className={`h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? "w-[60px]" : "w-[240px]"}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="font-medium text-lg">Categories</h2>}
          <div className="flex items-center gap-2 ml-auto">
            {!isCollapsed && (
              <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <Plus size={22} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
                      <Input id="name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Enter category name" />
                    </div>
                    <Button onClick={handleAddCategory} className="w-full">
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="ghost" size="icon" onClick={toggleCollapse} className={`hover:bg-gray-100 transition-transform duration-300 ${isCollapsed ? "ml-auto" : ""}`}>
              {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <button
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center group hover:bg-gray-100 transition-colors cursor-pointer",
              selectedCategoryId === null && "bg-gray-100 text-primary"
            )}
            onClick={() => handleCategoryClick(null)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Folder size={18} className={cn("flex-shrink-0", selectedCategoryId === null ? "text-primary" : "text-gray-400 group-hover:text-gray-500")} />
              {!isCollapsed && (
                <>
                  <span className="truncate">All Prompts</span>
                  <span className={cn("ml-auto text-xs px-2 py-0.5 rounded-md font-medium", selectedCategoryId === null ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500")}>
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
                  "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between group hover:bg-gray-100 transition-colors cursor-pointer",
                  selectedCategoryId === category.id && "bg-gray-100 text-primary"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Folder size={18} className={cn("flex-shrink-0", selectedCategoryId === category.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500")} />
                  {!isCollapsed && <span className="truncate flex-1">{category.name}</span>}
                  {!isCollapsed && (
                    <span
                      className={cn("ml-1 text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0", selectedCategoryId === category.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500")}
                    >
                      {category.prompt_count || 0}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded-md"
                    >
                      <Trash2 size={14} className="text-gray-500" />
                    </button>
                  </div>
                )}
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
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
