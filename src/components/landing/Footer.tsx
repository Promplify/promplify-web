import { Github, Twitter } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-bold text-primary">Promplify</h3>
            <p className="text-gray-600 mt-2">Amplify Your AI Potential</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-600 hover:text-primary">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Promplify. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};