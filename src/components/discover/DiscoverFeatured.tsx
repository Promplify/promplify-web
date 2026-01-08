import { Button } from "@/components/ui/button";
import { DiscoverPrompt } from "@/types/discover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { DiscoverCard } from "./DiscoverCard";

interface DiscoverFeaturedProps {
  featuredPrompts: DiscoverPrompt[];
}

// Custom hook to handle media queries with better performance
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function DiscoverFeatured({ featuredPrompts }: DiscoverFeaturedProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visiblePrompts, setVisiblePrompts] = useState<DiscoverPrompt[]>([]);

  // Use matchMedia instead of window.resize for better performance
  const isXl = useMediaQuery("(min-width: 1280px)");
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  // Calculate slidesToShow based on media queries
  const slidesToShow = isXl ? 4 : isLg ? 3 : isSm ? 2 : 1;

  // Update visible prompts
  useEffect(() => {
    if (featuredPrompts.length > 0) {
      const startIndex = currentSlide;
      const endIndex = Math.min(startIndex + slidesToShow, featuredPrompts.length);
      setVisiblePrompts(featuredPrompts.slice(startIndex, endIndex));
    }
  }, [currentSlide, featuredPrompts, slidesToShow]);

  const nextSlide = () => {
    setCurrentSlide((current) => (current + slidesToShow >= featuredPrompts.length ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((current) => (current === 0 ? Math.max(0, featuredPrompts.length - slidesToShow) : current - 1));
  };

  if (featuredPrompts.length === 0) return null;

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visiblePrompts.map((prompt) => (
          <DiscoverCard key={prompt.id} discoverPrompt={prompt} featured />
        ))}
      </div>

      {featuredPrompts.length > slidesToShow && (
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
          <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-md border border-gray-100 pointer-events-auto" onClick={prevSlide}>
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="ghost" className="h-10 w-10 rounded-full bg-white shadow-md border border-gray-100 pointer-events-auto" onClick={nextSlide}>
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next</span>
          </Button>
        </div>
      )}
    </div>
  );
}
