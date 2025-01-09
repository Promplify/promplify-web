import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Logo } from "./Logo";
import { Link } from "react-router-dom";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between" style={{ height: "68px" }}>
          <Logo />

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="https://github.com/promplify" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
              GitHub
            </a>
            <Link to="/auth">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 py-4">
            <div className="flex flex-col space-y-4 px-4">
              <a href="https://github.com/promplify" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                GitHub
              </a>
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full text-white border-white/20 hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}