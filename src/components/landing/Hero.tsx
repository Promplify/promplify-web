import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-up">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
        Amplify Your AI Potential
      </h1>
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
        Transform your AI interactions with powerful prompt engineering tools. 
        Make your AI conversations more effective, precise, and productive.
      </p>
      <div className="space-x-4">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Get Started
        </Button>
        <Button size="lg" variant="outline">
          Learn More
        </Button>
      </div>
    </div>
  );
};