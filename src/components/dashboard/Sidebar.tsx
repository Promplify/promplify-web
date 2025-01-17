import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { createCategory, deleteCategory, getCategories, updatePrompt } from "@/services/promptService";
import { Category } from "@/types/prompt";
import { ChevronLeft, ChevronRight, Folder, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  onCategorySelect?: (categoryId: string) => void;
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

  // 处理分类点击
  const handleCategoryClick = (categoryId: string) => {
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
      // 获取所有提示
      const { data: prompts } = await supabase.from("prompts").select("id").eq("category_id", categoryToDelete);

      // 获取默认分类（第一个分类）
      const defaultCategory = categories[0];
      if (!defaultCategory) {
        toast.error("No default category found");
        return;
      }

      // 将该分类下的所有提示移动到默认分类
      if (prompts && prompts.length > 0) {
        for (const prompt of prompts) {
          await updatePrompt(prompt.id, { category_id: defaultCategory.id });
        }
      }

      // 删除分类
      await deleteCategory(categoryToDelete);

      // 更新本地状态
      setCategories(categories.filter((c) => c.id !== categoryToDelete));
      if (selectedCategoryId === categoryToDelete) {
        onCategorySelect?.(null);
      }

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
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

      const newCategory = {
        name: newCategoryName.trim(),
        user_id: session.data.session.user.id,
      };

      const createdCategory = await createCategory(newCategory);
      setCategories([...categories, createdCategory]);

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
      <div className="w-[240px] h-full bg-gray-50 p-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
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
            onClick={() => onCategorySelect?.(null)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Folder size={18} className={cn("flex-shrink-0", selectedCategoryId === null ? "text-primary" : "text-gray-400 group-hover:text-gray-500")} />
              {!isCollapsed && <span className="truncate">All Prompts</span>}
            </div>
          </button>
          {categories.map((category) => (
            <div key={category.id} className="relative">
              <div
                onClick={() => handleCategoryClick(category.id)}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between group hover:bg-gray-100 transition-colors cursor-pointer",
                  selectedCategoryId === category.id && "bg-gray-100 text-primary"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Folder size={18} className={cn("flex-shrink-0", selectedCategoryId === category.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500")} />
                  <span className="truncate">{category.name}</span>
                  {!isCollapsed && (
                    <span className={cn("text-xs px-1.5 py-0.5 rounded-full", selectedCategoryId === category.id ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500")}>
                      {category.prompt_count || 0}
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
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
