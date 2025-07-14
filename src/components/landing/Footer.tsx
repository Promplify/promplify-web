import { Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/60 text-sm">© {new Date().getFullYear()} Promplify. All rights reserved.</div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="https://startupfa.me/s/promplify?utm_source=promplify.com" target="_blank">
              <img src="https://startupfa.me/badges/featured/dark-small.webp" alt="Featured on Startup Fame" width="224" height="36" />
            </a>
            <Link to="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <a href="mailto:support@promplify.com" className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://github.com/Promplify/promplify-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm transition-all duration-300 inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/10 group"
              title="⭐ Star us on GitHub"
            >
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                <Github className="w-3 h-3 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">Star</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
