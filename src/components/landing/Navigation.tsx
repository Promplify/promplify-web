import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between" style={{ height: "68px" }}>
          <Logo />
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
              How It Works
            </a>
            <Button className="bg-white text-black hover:bg-white/90">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
