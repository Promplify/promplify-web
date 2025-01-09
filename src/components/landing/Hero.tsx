import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-[65vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative animate-fade-up z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-8xl" style={{ lineHeight: "1.2" }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Amplify Your AI Potential</p>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 max-w-2xl">Your AI Prompt Management Platform</p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">Optimize your prompts, enhance your AI interactions, and unlock the full potential of artificial intelligence.</p>
      </div>
    </div>
  );
};