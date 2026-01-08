import { BookMarked, Code2, Gauge, Github, Sparkles } from "lucide-react";

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
  {
    icon: Code2,
    title: "API Access",
    description: "Access your prompts programmatically through our RESTful API with version control support",
  },
  {
    icon: Github,
    title: "User-Driven Development",
    description: "Help shape Promplify by submitting bug reports and feature requests through our GitHub issue tracker",
  },
];

const stats = [
  {
    value: "10K+",
    label: "Active Users",
    description: "Trusted by developers worldwide",
  },
  {
    value: "1M+",
    label: "Prompts Optimized",
    description: "Improving AI interactions daily",
  },
  {
    value: "99%",
    label: "Success Rate",
    description: "Consistently high performance",
  },
];

export const Features = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-white via-white to-gray-50/50" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 text-[#2C106A]">Features</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Everything You Need for Better Prompts</h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">Streamline your AI workflow with our comprehensive suite of prompt management tools</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div key={index} className="group relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#2C106A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#2C106A]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-[#2C106A]" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#2C106A]/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-16 md:mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C106A]/5 via-purple-500/5 to-[#2C106A]/5 rounded-2xl" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 rounded-2xl p-6 sm:p-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="mb-1">
                  <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">{stat.value}</span>
                </div>
                <div className="text-gray-800 font-medium mb-1">{stat.label}</div>
                <p className="text-sm text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
