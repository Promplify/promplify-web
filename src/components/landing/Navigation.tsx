import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary">How It Works</a>
            <Button variant="outline" className="ml-4">Sign In</Button>
            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};