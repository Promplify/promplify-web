import { Button } from "@/components/ui/button";
import { DiscoverPrompt } from "@/types/discover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { DiscoverCard } from "./DiscoverCard";

interface DiscoverFeaturedProps {
  featuredPrompts: DiscoverPrompt[];
}

export function DiscoverFeatured({ featuredPrompts }: DiscoverFeaturedProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visiblePrompts, setVisiblePrompts] = useState<DiscoverPrompt[]>([]);
  const [slidesToShow, setSlidesToShow] = useState(4);

  // Adjust the number of cards shown per row based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1);
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2);
      } else if (window.innerWidth < 1280) {
        setSlidesToShow(3);
      } else {
        setSlidesToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
