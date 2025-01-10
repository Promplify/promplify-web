import {
  ArchiveIcon,
  BookIcon,
  BrainCircuitIcon,
  ChevronLeft,
  ChevronRight,
  ClockIcon,
  CodeIcon,
  FolderIcon,
  GraduationCapIcon,
  LanguagesIcon,
  MessageSquareIcon,
  PencilIcon,
  StarIcon,
  TagIcon,
} from "lucide-react";
import { useState } from "react";

const categories = [
  { id: 1, name: "Favorites", icon: StarIcon, count: 12 },
  { id: 2, name: "All Prompts", icon: FolderIcon, count: 145 },
  { id: 3, name: "Recent", icon: ClockIcon, count: 8 },
  { id: 4, name: "Tags", icon: TagIcon, count: 24 },
  {
    id: 5,
    name: "Development",
    icon: CodeIcon,
    count: 45,
    subcategories: [
      { id: "5-1", name: "Code Generation", count: 15 },
      { id: "5-2", name: "Code Review", count: 12 },
      { id: "5-3", name: "Debugging", count: 18 },
    ],
  },
  {
    id: 6,
    name: "Writing",
    icon: PencilIcon,
    count: 38,
    subcategories: [
      { id: "6-1", name: "Content Creation", count: 14 },
      { id: "6-2", name: "Editing", count: 12 },
      { id: "6-3", name: "SEO", count: 12 },
    ],
  },
  {
    id: 7,
    name: "Education",
    icon: GraduationCapIcon,
    count: 25,
    subcategories: [
      { id: "7-1", name: "Lesson Plans", count: 8 },
      { id: "7-2", name: "Study Guides", count: 10 },
      { id: "7-3", name: "Research", count: 7 },
    ],
  },
  {
    id: 8,
    name: "AI & ML",
    icon: BrainCircuitIcon,
    count: 32,
    subcategories: [
      { id: "8-1", name: "Model Training", count: 12 },
      { id: "8-2", name: "Data Preparation", count: 10 },
      { id: "8-3", name: "Evaluation", count: 10 },
    ],
  },
  {
    id: 9,
    name: "Translation",
    icon: LanguagesIcon,
    count: 28,
    subcategories: [
      { id: "9-1", name: "Technical", count: 10 },
      { id: "9-2", name: "Marketing", count: 8 },
      { id: "9-3", name: "Legal", count: 10 },
    ],
  },
  {
    id: 10,
    name: "Documentation",
    icon: BookIcon,
    count: 22,
    subcategories: [
      { id: "10-1", name: "API Docs", count: 8 },
      { id: "10-2", name: "User Guides", count: 7 },
      { id: "10-3", name: "Technical Specs", count: 7 },
    ],
  },
  {
    id: 11,
    name: "Chat & Support",
    icon: MessageSquareIcon,
    count: 18,
    subcategories: [
      { id: "11-1", name: "Customer Service", count: 6 },
      { id: "11-2", name: "FAQ Generation", count: 6 },
      { id: "11-3", name: "Chat Flows", count: 6 },
    ],
  },
  { id: 12, name: "Archive", icon: ArchiveIcon, count: 35 },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => (prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]));
  };

  return (
    <div className={`h-full border-r border-border bg-background transition-all duration-300 ${isCollapsed ? "w-[60px]" : "w-[240px]"}`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className={`font-medium text-foreground ${isCollapsed ? "hidden" : "block"}`}>Categories</h2>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 hover:bg-accent hover:text-accent-foreground rounded">
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
      <div className="py-2">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => {
                setActiveCategory(category.id);
                if (category.subcategories) {
                  toggleCategory(category.id);
                }
              }}
              className={`w-full flex items-center px-3 py-2 space-x-2 ${activeCategory === category.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"} ${
                isCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <category.icon size={18} />
                {!isCollapsed && <span className="truncate">{category.name}</span>}
              </div>
              {!isCollapsed && <span className="text-xs text-muted-foreground">{category.count}</span>}
            </button>
            {!isCollapsed && category.subcategories && expandedCategories.includes(category.id) && (
              <div className="ml-6 border-l border-border">
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setActiveCategory(Number(sub.id))}
                    className={`w-full flex items-center px-3 py-1.5 text-sm justify-between ${
                      activeCategory === Number(sub.id) ? "text-accent-foreground bg-accent/50" : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
                    }`}
                  >
                    <span className="truncate">{sub.name}</span>
                    <span className="text-xs">{sub.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
