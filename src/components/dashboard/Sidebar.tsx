import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { createCategory, deleteCategory, getCategories, updatePrompt } from "@/services/promptService";
import { Category } from "@/types/prompt";
import { ChevronDown, ChevronLeft, ChevronRight, Folder, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SidebarProps {
  onCategorySelect?: (categoryId: string | null) => void;
  selectedCategoryId?: string | null;
}

export function Sidebar({ onCategorySelect, selectedCategoryId }: SidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (session.data.session?.user.id) {
          const data = await getCategories(session.data.session.user.id);
          // 组织成树形结构
          const rootCategories = data.filter((c) => !c.parent_id);
          const categoriesWithChildren = rootCategories.map((category) => ({
            ...category,
            subcategories: data.filter((c) => c.parent_id === category.id),
          }));
          setCategories(categoriesWithChildren);
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
        parent_id: selectedParentId,
      };

      const createdCategory = await createCategory(newCategory);

      if (selectedParentId) {
        // 更新父分类的子分类列表
        setCategories(
          categories.map((category) => {
            if (category.id === selectedParentId) {
              return {
                ...category,
                subcategories: [...(category.subcategories || []), createdCategory],
              };
            }
            return category;
          })
        );
      } else {
        // 添加到根分类列表
        setCategories([...categories, { ...createdCategory, subcategories: [] }]);
      }

      setNewCategoryName("");
      setSelectedParentId(undefined);
      setIsAddCategoryOpen(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
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
      const defaultCategory = categories.find((c) => !c.parent_id);
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
                    <div className="space-y-2">
                      <Label htmlFor="parent">Parent Category (Optional)</Label>
                      <select
                        id="parent"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md"
                        value={selectedParentId || ""}
                        onChange={(e) => setSelectedParentId(e.target.value || undefined)}
                      >
                        <option value="">None (Root Category)</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
            className={`w-full flex items-center rounded-md transition-all duration-200 ${
              selectedCategoryId === null ? "bg-gray-200 text-gray-900 shadow-sm ring-1 ring-gray-300/50" : "hover:bg-gray-100/70"
            }`}
            onClick={() => onCategorySelect?.(null)}
          >
            <div className={`flex items-center gap-2 px-3 py-2 ${isCollapsed ? "justify-center pl-[5px]" : ""}`}>
              <Folder size={20} className={`flex-shrink-0 transition-colors ${selectedCategoryId === null ? "text-gray-700" : "text-gray-400"}`} />
              {!isCollapsed && <span className="text-sm text-gray-700">All Prompts</span>}
            </div>
          </button>
          {categories.map((category) => (
            <div key={category.id}>
              <div className={`flex items-center ${selectedCategoryId === category.id ? "text-gray-700" : "text-gray-400"}`}>
                <button
                  className={`w-full flex items-center rounded-md transition-all duration-200 ${
                    selectedCategoryId === category.id ? "bg-gray-200 text-gray-900 shadow-sm ring-1 ring-gray-300/50" : "hover:bg-gray-100/70"
                  }`}
                  onClick={() => {
                    toggleCategory(category.id);
                    onCategorySelect?.(category.id);
                  }}
                >
                  <div className={`flex items-center gap-2 px-3 py-2 w-full ${isCollapsed ? "justify-center" : ""}`}>
                    <Folder size={20} className={`flex-shrink-0 transition-colors ${selectedCategoryId === category.id ? "text-gray-700" : "text-gray-400"}`} />
                    {!isCollapsed && (
                      <>
                        <span className="text-left text-sm text-gray-700 flex-1">{category.name}</span>
                        {category.subcategories?.length > 0 && (
                          <>
                            <span className="text-xs text-gray-400">{category.subcategories.length}</span>
                            <ChevronDown size={20} className={`text-gray-400 transition-transform duration-200 ${expandedCategories.includes(category.id) ? "rotate-0" : "-rotate-90"}`} />
                          </>
                        )}
                      </>
                    )}
                  </div>
                </button>
                {!isCollapsed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hover:bg-transparent">
                        <MoreVertical size={16} className={`${selectedCategoryId === category.id ? "text-gray-700" : "text-gray-400"}`} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50/50" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {!isCollapsed && expandedCategories.includes(category.id) && category.subcategories?.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      className={`w-full flex items-center rounded-md transition-all duration-200 ${
                        selectedCategoryId === subcategory.id ? "bg-gray-200 text-gray-900 shadow-sm ring-1 ring-gray-300/50" : "hover:bg-gray-100/70"
                      }`}
                      onClick={() => onCategorySelect?.(subcategory.id)}
                    >
                      <div className={`flex items-center gap-2 px-3 py-1.5 w-full ${isCollapsed ? "justify-center" : ""}`}>
                        <span className={`transition-colors ${selectedCategoryId === subcategory.id ? "text-gray-700" : "text-gray-400"}`}>{subcategory.icon || <Folder size={16} />}</span>
                        {!isCollapsed && <span className="text-sm text-gray-700">{subcategory.name}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
