import { BookMarked, Gauge, Sparkles } from "lucide-react";

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
    <div className="py-24 bg-gradient-to-b from-white to-gray-50" id="features">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything You Need for Better Prompts
        </h2>
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Streamline your AI workflow with our comprehensive suite of prompt management tools
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-[#2C106A]/10 flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-[#2C106A]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};