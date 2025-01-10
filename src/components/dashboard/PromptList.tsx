import { ArrowDownUp, Plus, Search, Star } from "lucide-react";

interface PromptMeta {
  id: string;
  title: string;
  tags: string[];
  tokenCount: number;
  updatedAt: string;
  description: string;
  version: string;
  rating?: number;
}

const mockPrompts: PromptMeta[] = [
  {
    id: "1",
    title: "Code Optimization Assistant",
    description: "Helps optimize and refactor code, provides performance suggestions",
    tags: ["programming", "optimization", "refactoring"],
    tokenCount: 1200,
    updatedAt: "2024-01-10",
    version: "v2.1.0",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Content Writing Assistant",
    description: "Generates marketing copy and product descriptions",
    tags: ["marketing", "writing"],
    tokenCount: 800,
    updatedAt: "2024-01-09",
    version: "v1.3.2",
  },
  {
    id: "3",
    title: "Data Analysis Assistant",
    description: "Assists with data analysis and visualization suggestions",
    tags: ["data", "analysis", "visualization"],
    tokenCount: 1500,
    updatedAt: "2024-01-08",
    version: "v2.0.0",
  },
  {
    id: "4",
    title: "Translation Assistant",
    description: "Provides multilingual translation and localization suggestions",
    tags: ["translation", "localization"],
    tokenCount: 900,
    updatedAt: "2024-01-07",
    version: "v1.2.1",
  },
  {
    id: "5",
    title: "Research Paper Assistant",
    description: "Helps with academic writing and research paper formatting",
    tags: ["academic", "research", "writing"],
    tokenCount: 2000,
    updatedAt: "2024-01-06",
    version: "v1.0.0",
  },
  {
    id: "6",
    title: "SQL Query Generator",
    description: "Generates and optimizes SQL queries based on requirements",
    tags: ["database", "sql", "optimization"],
    tokenCount: 1100,
    updatedAt: "2024-01-05",
    version: "v1.5.0",
  },
  {
    id: "7",
    title: "API Documentation Helper",
    description: "Assists in writing clear and comprehensive API documentation",
    tags: ["api", "documentation", "technical"],
    tokenCount: 1300,
    updatedAt: "2024-01-04",
    version: "v1.1.0",
  },
  {
    id: "8",
    title: "UX Writing Assistant",
    description: "Helps create user-friendly interface text and microcopy",
    tags: ["ux", "writing", "interface"],
    tokenCount: 950,
    updatedAt: "2024-01-03",
    version: "v1.4.2",
  },
];

export function PromptList() {
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
            <button className="flex items-center space-x-1 hover:text-gray-900">
              <Star size={14} />
              <span>Rating</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-gray-900">
              <ArrowDownUp size={14} />
              <span>Date</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100%-145px)]">
        <div className="p-2">
          <div className="space-y-2">
            {mockPrompts.map((prompt) => (
              <div key={prompt.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 hover:border-gray-200">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                  <div className="flex items-center space-x-2">
                    {prompt.rating && (
                      <span className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star size={12} className="mr-1" />
                        {prompt.rating}
                      </span>
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
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">{prompt.tokenCount} tokens</span>
                </div>
                <div className="mt-2 text-xs text-gray-400">Updated {prompt.updatedAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
