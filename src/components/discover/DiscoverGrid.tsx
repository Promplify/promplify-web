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
    const maxButtons = 5; // Maximum number of page buttons to show

    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button key={i} variant={currentPage === i ? "default" : "outline"} className={`h-10 w-10 ${currentPage === i ? "bg-[#2C106A]" : "border-gray-200"}`} onClick={() => onPageChange(i)}>
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button variant="outline" className="h-10 px-4 border-gray-200" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>

        {startPage > 1 && (
          <>
            <Button variant="outline" className="h-10 w-10 border-gray-200" onClick={() => onPageChange(1)}>
              1
            </Button>
            {startPage > 2 && <span className="mx-2">...</span>}
          </>
        )}

        {pages}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="mx-2">...</span>}
            <Button variant="outline" className="h-10 w-10 border-gray-200" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}

        <Button variant="outline" className="h-10 px-4 border-gray-200" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div id="all-prompts" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
            <div className="h-40 bg-gray-200 rounded-md animate-pulse mb-4"></div>
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
      <div id="all-prompts" className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-600">No prompts yet</h3>
        <p className="text-gray-500 mt-2">Be the first to share a prompt!</p>
      </div>
    );
  }

  return (
    <div>
      <div id="all-prompts" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {prompts.map((prompt) => (
          <DiscoverCard key={prompt.id} discoverPrompt={prompt} />
        ))}
      </div>

      {totalPages > 1 && renderPagination()}
    </div>
  );
}
