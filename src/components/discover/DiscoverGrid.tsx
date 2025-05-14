import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DiscoverPrompt } from "@/types/discover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DiscoverCard } from "./DiscoverCard";

interface DiscoverGridProps {
  prompts: DiscoverPrompt[];
  isLoading: boolean;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function DiscoverGrid({ prompts, isLoading, currentPage, totalItems, itemsPerPage, onPageChange }: DiscoverGridProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Render pagination buttons
  const renderPagination = () => {
    const pages = [];
    const maxButtons = window.innerWidth < 640 ? 3 : 5; // 在小屏幕上减少页码按钮数量

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          className={`h-8 sm:h-10 w-8 sm:w-10 ${currentPage === i ? "bg-[#2C106A]" : "border-gray-200"}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-8">
        <Button variant="outline" className="h-8 sm:h-10 px-2 sm:px-4 border-gray-200" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {startPage > 1 && (
          <>
            <Button variant="outline" className="h-8 sm:h-10 w-8 sm:w-10 border-gray-200" onClick={() => onPageChange(1)}>
              1
            </Button>
            {startPage > 2 && <span className="mx-1 sm:mx-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-1 sm:mx-2">...</span>}
            <Button variant="outline" className="h-8 sm:h-10 w-8 sm:w-10 border-gray-200" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button variant="outline" className="h-8 sm:h-10 px-2 sm:px-4 border-gray-200" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div id="all-prompts" className="px-2 sm:px-4 lg:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-7">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="h-36 sm:h-40 bg-gray-200 rounded-md animate-pulse mb-4"></div>
            <Skeleton className="h-6 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="mt-auto flex justify-between items-center">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div id="all-prompts" className="text-center py-8 sm:py-12 px-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.663 17h4.673M12 3v1m0 16v1m-9-9h1m8-9l-.707.707M5.343 5.343l-.707-.707m12.728 0l-.707.707M6 12a6 6 0 1112 0 6 6 0 01-12 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No prompts found</h3>
        <p className="mt-1 text-gray-500">Be the first to share an amazing prompt!</p>
        <div className="mt-6">
          <Button onClick={() => (window.location.href = "/dashboard")} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white">
            Share a Prompt
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div id="all-prompts" className="px-2 sm:px-4 lg:px-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-7">
        {prompts.map((prompt) => (
          <DiscoverCard key={prompt.id} discoverPrompt={prompt} />
        ))}
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
}
