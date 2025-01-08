import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-up">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-primary inline-block">
          Promplify:
        </span>
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Amplify Your AI Potential
        </span>
      </h1>
      <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 max-w-2xl">
        Boost Your Prompts. Empower Your AI.
      </p>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
        Manage, optimize, and master your AI prompts in one place. 
        Get AI-powered suggestions and best practices to make your prompts more effective.
      </p>
      <div className="space-x-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Start Managing Prompts
        </Button>
        <Button size="lg" variant="outline">
          Learn Best Practices
        </Button>
      </div>
    </div>
  );
};