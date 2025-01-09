import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Save Your Prompts",
    description: "Store and organize all your AI prompts in one central location",
  },
  {
    number: "02",
    title: "Optimize & Improve",
    description: "Get AI-powered suggestions to enhance your prompts' effectiveness",
  },
  {
    number: "03",
    title: "Monitor Tokens",
    description: "Track token usage and optimize prompt lengths for better results",
  },
];

export const HowItWorks = () => {
  return (
    <div className="py-24" id="how-it-works">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-4xl font-bold text-primary/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Managing Your Prompts
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};
