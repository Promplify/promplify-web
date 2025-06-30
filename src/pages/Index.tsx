import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEO
        canonicalPath="/"
        title="Promplify - AI Prompt Management & Optimization Platform"
        description="Create, organize, and optimize your AI prompts. Enhance your interactions with ChatGPT, Claude, and other AI models. Boost productivity and get better results with Promplify."
        keywords="AI prompt management, prompt optimization, ChatGPT prompts, Claude prompts, AI workflow, prompt templates, AI assistant, prompt library, prompt engineering, LLM prompts"
      />
      <Navigation />
      <main className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
