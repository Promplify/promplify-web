import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    title: "Input Your Prompt",
    description: "Start with your basic prompt or choose from our templates",
  },
  {
    number: "02",
    title: "Enhance & Refine",
    description: "Our AI analyzes and suggests improvements to your prompt",
  },
  {
    number: "03",
    title: "Get Results",
    description: "See better responses from your favorite AI models",
  },
];

export const HowItWorks = () => {
  return (
    <div className="py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-4xl font-bold text-primary/20 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Try It Now
          </Button>
        </div>
      </div>
    </div>
  );
};