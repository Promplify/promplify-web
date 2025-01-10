import { ArrowDownUp, Heart, Plus, Search, Star } from "lucide-react";
import { useState } from "react";

interface PromptMeta {
  id: string;
  title: string;
  tags: string[];
  tokenCount: number;
  updatedAt: string;
  description: string;
  version: string;
  rating?: number;
  isFavorite?: boolean;
}

type SortOption = "date" | "rating";

const mockPrompts: PromptMeta[] = [
  {
    id: "1",
    title: "Code Optimization Assistant",
    description: "Helps optimize and refactor code, provides performance suggestions",
    tags: ["programming", "optimization", "refactoring"],
    tokenCount: 1200,
    updatedAt: "2024-01-10",
    version: "v2.1.0",
    rating: 10,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Content Writing Assistant",
    description: "Generates marketing copy and product descriptions",
    tags: ["marketing", "writing"],
    tokenCount: 800,
    updatedAt: "2024-01-09",
    version: "v1.3.2",
    rating: 9,
    isFavorite: false,
  },
  {
    id: "3",
    title: "Data Analysis Assistant",
    description: "Assists with data analysis and visualization suggestions",
    tags: ["data", "analysis", "visualization"],
    tokenCount: 1500,
    updatedAt: "2024-01-08",
    version: "v2.0.0",
    rating: 8,
    isFavorite: false,
  },
  {
    id: "4",
    title: "Translation Assistant",
    description: "Provides multilingual translation and localization suggestions",
    tags: ["translation", "localization"],
    tokenCount: 900,
    updatedAt: "2024-01-07",
    version: "v1.2.1",
    rating: 7,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Research Paper Assistant",
    description: "Helps with academic writing and research paper formatting",
    tags: ["academic", "research", "writing"],
    tokenCount: 2000,
    updatedAt: "2024-01-06",
    version: "v1.0.0",
    rating: 7,
    isFavorite: false,
  },
  {
    id: "6",
    title: "SQL Query Generator",
    description: "Generates and optimizes SQL queries based on requirements",
    tags: ["database", "sql", "optimization"],
    tokenCount: 1100,
    updatedAt: "2024-01-05",
    version: "v1.5.0",
    rating: 6,
    isFavorite: false,
  },
  {
    id: "7",
    title: "API Documentation Helper",
    description: "Assists in writing clear and comprehensive API documentation",
    tags: ["api", "documentation", "technical"],
    tokenCount: 1300,
    updatedAt: "2024-01-04",
    version: "v1.1.0",
    rating: 6,
    isFavorite: false,
  },
  {
    id: "8",
    title: "UX Writing Assistant",
    description: "Helps create user-friendly interface text and microcopy",
    tags: ["ux", "writing", "interface"],
    tokenCount: 950,
    updatedAt: "2024-01-03",
    version: "v1.4.2",
    rating: 5,
    isFavorite: false,
  },
];

export function PromptList() {
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [showFavorites, setShowFavorites] = useState(false);

  return (
    <div className="w-[320px] h-full bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Prompts</h2>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Plus size={20} />
          </button>
        </div>
        <div className="relative mb-4">
          <input type="text" placeholder="Search prompts..." className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md" />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>145 prompts</span>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowFavorites(!showFavorites)} className={`flex items-center space-x-1 min-w-[80px] justify-center ${showFavorites ? "text-red-500" : "hover:text-gray-900"}`}>
              <Heart size={14} className={showFavorites ? "fill-current" : ""} />
              <span>Favorites</span>
            </button>
            <button onClick={() => setSortBy(sortBy === "date" ? "rating" : "date")} className="flex items-center space-x-1 min-w-[100px] justify-center hover:text-gray-900">
              <ArrowDownUp size={14} />
              <span>Sort: {sortBy === "date" ? "Rating" : "Date"}</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100%-145px)]">
        <div className="p-2">
          <div className="space-y-2">
            {mockPrompts.map((prompt) => (
              <div key={prompt.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200 group">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate flex-1">{prompt.title}</h3>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button>
                      <Heart size={14} className={`transition-colors ${prompt.isFavorite ? "text-red-500 fill-current" : "text-gray-400"}`} />
                    </button>
                    {prompt.rating && (
                      <div className="flex items-center text-xs">
                        <Star size={12} className="text-amber-500 fill-current" />
                        <span className="ml-1 text-gray-700">{prompt.rating}</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">{prompt.version}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{prompt.description}</p>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                  <span className="px-1.5 py-0.5 bg-green-50 text-green-600 rounded">{prompt.tokenCount} tokens</span>
                  <span>Updated {prompt.updatedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
