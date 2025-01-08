import { Github, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo />
            <p className="text-white/80 mt-2 text-sm">Amplify Your AI Potential</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Promplify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
