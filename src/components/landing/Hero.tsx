import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Hero = () => {
  const [productHuntLoaded, setProductHuntLoaded] = useState(false);
  const [productHuntError, setProductHuntError] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!productHuntLoaded) {
        setProductHuntError(true);
      }
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [productHuntLoaded]);

  return (
    <div className="relative min-h-[50vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-6">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob will-change-transform" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000 will-change-transform" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000 will-change-transform" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse will-change-transform" />
      </div>

      <div className="relative animate-fade-up z-10 max-w-4xl mx-auto will-change-transform">
        <div className="mb-4 animate-bounce-slow">
          <span className="inline-block px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-[#2C106A]/10 to-purple-500/10 text-[#2C106A] border border-[#2C106A]/20">
            AI Prompt Management Made Simple
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-3 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-7xl animate-gradient-x" style={{ lineHeight: "1.1" }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Amplify Your AI Potential</p>
        </h1>

        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-3 max-w-2xl mx-auto">Your Professional AI Prompt Management Platform</p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Create, organize, and optimize your AI prompts with our intelligent platform. Track tokens, manage versions, and collaborate with your team seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
          <Button asChild size="lg" className="group bg-[#2C106A] hover:bg-[#2C106A]/90 text-white px-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <Link to="/dashboard">
              Get Started <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-[#2C106A] text-[#2C106A] hover:bg-[#2C106A]/5 shadow-md hover:shadow-lg transition-all duration-300 group relative px-4">
            <a href="https://github.com/Promplify/promplify-issues" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
              <Github className="h-4 w-4" />
              Feedback & Issues
            </a>
          </Button>
        </div>

        {/* Product Hunt Notice */}
        <div className="relative mb-2">
          <div className="px-6 py-2.5 bg-[#EA532A]/5 backdrop-blur-sm rounded-full border border-[#EA532A]/20 shadow-lg">
            🎉&nbsp;<span className="text-sm font-medium bg-gradient-to-r from-[#EA532A] to-[#EA532A]/70 bg-clip-text text-transparent">We're live on Product Hunt, support us with your vote!</span>
          </div>
          <div className="w-0.5 h-2 from-[#EA532A]/20 to-transparent mx-auto mt-2"></div>
        </div>

        {/* Product Hunt Badge */}
        <div className="flex justify-center mb-6">
          <div className="relative min-h-[54px] group">
            {!productHuntError ? (
              <a
                href="https://www.producthunt.com/posts/promplify?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-promplify"
                target="_blank"
                rel="noopener noreferrer"
                className={cn("transform hover:scale-[1.02] transition-all duration-300 relative block", !productHuntLoaded && "opacity-0")}
              >
                <div className="absolute -inset-2.5 rounded-lg blur-sm group-hover:blur transition-all duration-300"></div>
                <div className="relative">
                  <img
                    src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=785256&theme=light&t=1737199216475"
                    alt="Promplify - Amplify Your AI Potential | Product Hunt"
                    width="250"
                    height="54"
                    style={{ width: "250px", height: "54px" }}
                    onError={() => setProductHuntError(true)}
                    onLoad={() => setProductHuntLoaded(true)}
                    className="rounded"
                  />
                </div>
              </a>
            ) : (
              <a
                href="https://www.producthunt.com/posts/promplify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-md bg-[#EA532A] text-white hover:bg-[#EA532A]/90 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 40 40" fill="currentColor">
                  <path d="M20 0C8.95 0 0 8.95 0 20c0 11.05 8.95 20 20 20s20-8.95 20-20C40 8.95 31.05 0 20 0zm0 36c-8.82 0-16-7.18-16-16S11.18 4 20 4s16 7.18 16 16-7.18 16-16 16z" />
                  <path d="M22.5 20H17v-6h5.5c1.65 0 3 1.35 3 3s-1.35 3-3 3zM17 26v-6h5.5c1.65 0 3 1.35 3 3s-1.35 3-3 3H17z" />
                </svg>
                View on Product Hunt
              </a>
            )}
            {!productHuntLoaded && !productHuntError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-[#EA532A] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wave transition */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white/80" />
      <div className="absolute -bottom-[4.25rem] left-0 right-0 animate-wave">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 45C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V30Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
};
