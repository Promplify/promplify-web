import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="relative animate-fade-up z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-8xl" style={{ lineHeight: "1.2" }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Amplify Your AI Potential</p>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 max-w-2xl mx-auto">Your AI Prompt Management Platform</p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">Optimize your prompts, enhance your AI interactions, and unlock the full potential of artificial intelligence.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-[#2C106A] hover:bg-[#2C106A]/90 text-white px-8">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/5">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};