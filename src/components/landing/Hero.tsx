import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const Hero = () => {
  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob will-change-transform" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 will-change-transform" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 will-change-transform" />
      </div>

      <div className="relative animate-fade-up z-10 max-w-4xl mx-auto will-change-transform">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-8xl" style={{ lineHeight: "1.2" }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Amplify Your AI Potential</p>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-4 max-w-2xl mx-auto">Your AI Prompt Management Platform</p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">Optimize your prompts, enhance your AI interactions, and unlock the full potential of artificial intelligence.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="bg-[#2C106A] hover:bg-[#2C106A]/90 text-white px-8 shadow-lg hover:shadow-xl transition-transform duration-300 transform hover:-translate-y-1">
            <Link to="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/5 shadow-md hover:shadow-lg transition-transform duration-300" asChild>
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>

      {/* Decorative bottom wave for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white/80" />
      <div className="absolute -bottom-1 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 45C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V30Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};
