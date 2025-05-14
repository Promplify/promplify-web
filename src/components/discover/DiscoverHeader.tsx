import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DiscoverHeader() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Prompt Discover</h1>
          <p className="text-xl text-gray-700 mb-8">Discover, share, and save the best AI prompts. Join our community to explore amazing prompts created by users and share your own creativity.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/dashboard")} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white px-6 py-2">
              Share My Prompts
            </Button>
            <Button variant="outline" onClick={() => document.getElementById("all-prompts")?.scrollIntoView({ behavior: "smooth" })} className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/10">
              Browse All Prompts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
