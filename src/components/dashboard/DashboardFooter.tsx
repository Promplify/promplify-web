import { Github, Mail } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="w-full bg-black border-t border-white/10">
      <div className="h-12 px-8 flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span className="hover:text-white transition-colors">Promplify, Amplify Your AI Potential.</span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="https://github.com/Promplify/promplify-web/issues" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors group">
            <Github size={18} className="transform group-hover:scale-110 transition-transform" />
          </a>
          <a href="mailto:support@promplify.com" className="text-gray-400 hover:text-white transition-colors group">
            <Mail size={18} className="transform group-hover:scale-110 transition-transform" />
          </a>
          <span className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Promplify.</span>
        </div>
      </div>
    </footer>
  );
}
