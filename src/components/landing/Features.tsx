import { BookMarked, Sparkles, Gauge } from "lucide-react";

const features = [
  {
    icon: BookMarked,
    title: "Centralized Prompt Management",
    description: "Store, organize, and access all your AI prompts in one secure location",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Optimization",
    description: "Get intelligent suggestions to improve your prompts and learn best practices",
  },
  {
    icon: Gauge,
    title: "Token Management",
    description: "Track and optimize your prompt lengths with built-in token management",
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Everything You Need for Better Prompts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};