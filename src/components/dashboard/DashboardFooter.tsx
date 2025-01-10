import { Github, Mail } from "lucide-react";

export function DashboardFooter() {
  return (
    <footer className="w-full bg-black">
      <div className="h-12 px-4 flex items-center justify-between w-full">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <span>&copy; {new Date().getFullYear()} Promptify.</span>
          <span>All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400 text-sm">Amplify Your AI Potential.</span>
          <a href="https://github.com/promptify" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <Github size={18} />
          </a>
          <a href="mailto:support@promptify.com" className="text-gray-400 hover:text-white transition-colors">
            <Mail size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
