import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { createCategory, getCategories } from "@/services/promptService";
import { Category } from "@/types/prompt";
import { ChevronLeft, ChevronRight, Folder, Plus } from "lucide-react";
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
    <div className={`h-full bg-gray-50 border-r border-gray-200 transition-all duration-300 ${isCollapsed ? "w-[60px]" : "w-[240px]"}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && <h2 className="font-medium text-lg">Categories</h2>}
          <div className="flex items-center gap-2">
            {!isCollapsed && (
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Plus size={22} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hover:bg-gray-100">
              {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
            </Button>
          </div>
        </div>
        <div className="space-y-1">
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700 ${selectedCategoryId === null ? "bg-gray-100" : ""}`}
            onClick={() => onCategorySelect?.(null)}
          >
            <Folder size={20} className="text-gray-400" />
            {!isCollapsed && <span className="flex-1 text-left">All Prompts</span>}
          </button>
          {categories.map((category) => (
            <div key={category.id}>
              <button
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md text-sm text-gray-700 ${selectedCategoryId === category.id ? "bg-gray-100" : ""}`}
                onClick={() => {
                  toggleCategory(category.id);
                  onCategorySelect?.(category.id);
                }}
              >
                {category.icon ? <span className="text-gray-400">{category.icon}</span> : <Folder size={20} className="text-gray-400" />}
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{category.name}</span>
                    {category.subcategories?.length > 0 && <span className="text-xs text-gray-400">{category.subcategories.length}</span>}
                  </>
                )}
              </button>
              {!isCollapsed && expandedCategories.includes(category.id) && category.subcategories?.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {category.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md text-sm text-gray-700 ${selectedCategoryId === subcategory.id ? "bg-gray-100" : ""}`}
                      onClick={() => onCategorySelect?.(subcategory.id)}
                    >
                      <span className="text-gray-400">{subcategory.icon || <Folder size={16} />}</span>
                      <span className="flex-1 text-left">{subcategory.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
