import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-[55vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="relative animate-fade-up z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-8xl" style={{ lineHeight: '1.2' }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">
            Amplify Your AI Potential
          </p>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 max-w-2xl">
          Boost Your Prompts, Empower Your AI.
        </p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
          Manage, optimize, and master your AI prompts in one place. 
          Get AI-powered suggestions and best practices to make your prompts more effective.
        </p>
        <div className="space-x-4">
          <Button size="lg" className="bg-[#2C106A] hover:bg-[#2C106A]/90 text-white px-8">
            Start Managing Prompts
          </Button>
          <Button size="lg" variant="outline" className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/10">
            Learn Best Practices
          </Button>
        </div>
      </div>
    </div>
  );
};