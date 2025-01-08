import { Github, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <Logo />
            <p className="text-white/80 mt-2 text-sm text-center md:text-left">Amplify Your AI Potential</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/60">
          <p className="text-sm">&copy; {new Date().getFullYear()} Promplify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
