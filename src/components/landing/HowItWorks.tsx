import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked, Gauge, Share2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: BookMarked,
    title: "Create & Save",
    description: "Create and store your AI prompts in our intuitive editor with multi-model support",
    comingSoon: false,
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Optimize & Improve",
    description: "Get AI-powered suggestions to enhance your prompts and improve their effectiveness",
    comingSoon: false,
  },
  {
    number: "03",
    icon: Share2,
    title: "Share & Collaborate",
    description: "Share your best prompts and collaborate with team members in real-time",
    comingSoon: false,
  },
  {
    number: "04",
    icon: Gauge,
    title: "Monitor & Analyze",
    description: "Track token usage and analyze prompt performance with real-time monitoring tools",
    comingSoon: true,
  },
];

export const HowItWorks = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-gray-50/50 to-white" id="how-it-works">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 text-[#2C106A]">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Start Your AI Prompt Journey in 4 Steps</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Simple and intuitive process to help you get started and achieve the best results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12 px-4 md:px-6 lg:px-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group hover:-translate-y-1 transition-transform duration-300">
              <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="absolute -top-3 -right-3 bg-[#2C106A] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">{step.number}</div>

                <div className="relative h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-[#2C106A]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-[#2C106A]" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{step.title}</h3>
                    {step.comingSoon && (
                      <div className="absolute top-0 right-0">
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-yellow-100/80 text-yellow-800 backdrop-blur-sm">Coming Soon</span>
                      </div>
                    )}
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3">{step.description}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-[#2C106A]/30" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button size="lg" className="bg-[#2C106A] hover:bg-[#2C106A]/90 group px-8">
              Start Managing Your Prompts
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/auth" className="text-[#2C106A] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
