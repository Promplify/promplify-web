import { Button } from "@/components/ui/button";
import { Library, MessageSquareShare, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const discoverBenefits = [
  {
    title: "Community prompts",
    description: "Explore prompt ideas shared by other builders before starting from a blank page.",
    Icon: MessageSquareShare,
  },
  {
    title: "Shared prompts",
    description: "Save useful shared prompts into your own workspace and adapt them for repeatable tasks.",
    Icon: Sparkles,
  },
  {
    title: "Prompt library",
    description: "Turn proven examples into a prompt library your future workflows can reuse.",
    Icon: Library,
  },
];

export function DiscoverHeader() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 py-8 sm:py-10 md:py-12 px-3 sm:px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 rounded-full bg-[#2C106A]/5 text-[#2C106A] text-xs sm:text-sm font-medium border border-[#2C106A]/10">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Community prompts and shared prompt ideas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 leading-tight">Discover Shared AI Prompts</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 md:mb-8 px-1">
            Browse community prompts, learn from shared prompt examples, and save the best ideas into your own prompt library for repeatable AI workflows.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-5 md:mb-7 text-left">
            {discoverBenefits.map(({ title, description, Icon }) => (
              <div key={title} className="rounded-lg border border-[#2C106A]/10 bg-white/65 p-4 shadow-sm">
                <Icon className="w-5 h-5 text-[#2C106A] mb-2" />
                <h2 className="text-sm font-semibold text-gray-950 mb-1">{title}</h2>
                <p className="text-xs leading-5 text-gray-600">{description}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => document.getElementById("all-prompts")?.scrollIntoView({ behavior: "smooth" })}
              className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/10 text-sm md:text-base"
            >
              Browse All Prompts
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="bg-[#2C106A] hover:bg-[#1F0B4C] text-white px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base">
              Share a Prompt
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-4 mx-auto max-w-3xl leading-5">
            Share prompts responsibly and review each prompt before using it in professional, legal, medical, financial, or sensitive workflows.
          </p>
        </div>
      </div>
    </div>
  );
}
