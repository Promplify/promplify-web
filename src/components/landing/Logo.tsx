import { Sparkles } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <span className="text-xl font-bold text-primary">Promplify</span>
    </div>
  );
};