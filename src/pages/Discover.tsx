import { DiscoverFeatured } from "@/components/discover/DiscoverFeatured";
import { DiscoverGrid } from "@/components/discover/DiscoverGrid";
import { DiscoverHeader } from "@/components/discover/DiscoverHeader";
import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDiscoverPrompts, getFeaturedDiscoverPrompts } from "@/services/plazaService";
import { DiscoverPrompt } from "@/types/discover";
import { updateMeta } from "@/utils/meta";
import { useEffect, useState } from "react";

const Discover = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [discoverPrompts, setDiscoverPrompts] = useState<DiscoverPrompt[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<DiscoverPrompt[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<"likes_count" | "created_at">("likes_count");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    updateMeta(
      "Prompt Discover - Discover and Share AI Prompts",
      "Explore and share the best AI prompts in our community. Find inspiration for ChatGPT, Claude, and other AI models. Create, save, and remix your favorite prompts.",
      "AI prompt discover, prompt sharing, community prompts, AI prompt library, ChatGPT prompts, Claude prompts, prompt engineering, AI prompt templates"
    );
  }, []);

  useEffect(() => {
    const fetchDiscoverContent = async () => {
      setIsLoading(true);
      try {
        // Get featured prompts
        const featuredData = await getFeaturedDiscoverPrompts(5);
        setFeaturedPrompts(featuredData);

        // Get all prompts
        const offset = (currentPage - 1) * itemsPerPage;
        const { data, count } = await getDiscoverPrompts(itemsPerPage, offset, sortBy);
        setDiscoverPrompts(data);
        setTotalCount(count || 0);
      } catch (error) {
        console.error("Error fetching discover content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscoverContent();
  }, [currentPage, sortBy]);

  const handleSortChange = (value: "likes_count" | "created_at") => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
            <SEO 
        canonicalPath="/discover" 
        title="Prompt Discover - Discover and Share AI Prompts"
        description="Explore and share the best AI prompts in our community. Find inspiration for ChatGPT, Claude, and other AI models. Create, save, and remix your favorite prompts."
        keywords="AI prompt discover, prompt sharing, community prompts, AI prompt library, ChatGPT prompts, Claude prompts, prompt engineering, AI prompt templates"
      />
      <Navigation />
      <main className="pt-16 pb-16">
        <DiscoverHeader />

        {featuredPrompts.length > 0 && (
          <section className="container mx-auto px-4 max-w-7xl mt-10">
            <h2 className="text-2xl font-bold mb-6">Featured Prompts</h2>
            <DiscoverFeatured featuredPrompts={featuredPrompts} />
          </section>
        )}

        <section className="container mx-auto px-4 max-w-7xl mt-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">All Prompts</h2>
            <Tabs defaultValue={sortBy} onValueChange={(value) => handleSortChange(value as any)}>
              <TabsList>
                <TabsTrigger value="likes_count">Most Popular</TabsTrigger>
                <TabsTrigger value="created_at">Recently Added</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <DiscoverGrid prompts={discoverPrompts} isLoading={isLoading} currentPage={currentPage} totalItems={totalCount} itemsPerPage={itemsPerPage} onPageChange={handlePageChange} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Discover;
