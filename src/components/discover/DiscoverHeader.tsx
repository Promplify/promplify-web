import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DiscoverHeader() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 py-10 md:pt-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-[#2C106A]/5 text-[#2C106A] text-sm font-medium border border-[#2C106A]/10">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Discover Premium Product Prompts</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 leading-tight">Prompt Discover</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 md:mb-8 px-1">
            Discover, share, and save the best AI prompts. Join our community to explore amazing prompts created by users and share your own creativity.
          </p>
          <p className="text-sm text-gray-600 mb-4 md:mb-6 italic border-l-2 border-purple-300 pl-3 mx-auto max-w-3xl bg-white/50 py-2 rounded leading-5">
            All shared prompts should comply with legal requirements. Some prompts are intended for personal learning and research only - please use them responsibly and stay aware of any potential
            legal considerations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById("all-prompts")?.scrollIntoView({ behavior: "smooth" })}
              className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/10 text-sm md:text-base"
            >
              Browse All Prompts
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base">
              Share My Prompts
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
