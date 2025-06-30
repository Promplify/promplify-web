import { Github, Mail } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-black py-6 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-white/60 text-sm">© {new Date().getFullYear()} Promplify. All rights reserved.</div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
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
              href="https://github.com/Promplify/promplify-issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
