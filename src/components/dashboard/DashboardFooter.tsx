import { Github, Mail } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="w-full bg-black">
      <div className="h-12 px-4 flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>Promptify, Amplify Your AI Potential.</span>
        </div>
        <div className="flex items-center space-x-4">
          <a href="https://github.com/promptify" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Github size={18} />
          </a>
          <a href="mailto:support@promptify.com" className="text-gray-400 hover:text-white transition-colors">
            <Mail size={18} />
          </a>
          <span className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Promptify.</span>
        </div>
      </div>
    </footer>
  );
}
