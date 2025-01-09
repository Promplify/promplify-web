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
    <div className="py-16 bg-gradient-to-b from-white to-gray-50/50" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">
            Everything You Need for Better Prompts
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Streamline your AI workflow with our comprehensive suite of prompt management tools
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C106A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#2C106A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-[#2C106A]" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};