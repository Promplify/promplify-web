import { Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black py-6 mt-auto">
      <div className="container mx-auto px-6">
        {/* Responsive layout: vertical stack on mobile, horizontal on desktop */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:items-center">
          {/* Copyright text */}
          <div className="text-white/60 text-sm text-center md:text-left">© {new Date().getFullYear()} Promplify. All rights reserved.</div>

          {/* Right content: badge, links, and icons */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 md:gap-6">
            {/* Links and social icons grouped together */}
            <div className="flex items-center flex-wrap justify-center gap-3 sm:gap-4 md:gap-6">
              <Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors whitespace-nowrap">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors whitespace-nowrap">
                Terms of Service
              </Link>

              {/* Separator - hidden on very small screens */}
              <div className="hidden sm:block h-4 w-px bg-white/20" />

              {/* Social icons with adequate touch targets */}
              <a href="mailto:support@promplify.com" className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5 p-2 -m-2" aria-label="Email support">
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Promplify/promplify-web"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-sm transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 group"
                title="Star us on GitHub"
                aria-label="Star us on GitHub"
              >
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                  <Github className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Star</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
