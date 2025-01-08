import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <div className="relative min-h-[65vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#2C106A]/10 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="relative animate-fade-up z-10">
        <div className="inline-block mb-4 px-3 py-1 rounded-full bg-purple-100 text-[#2C106A] text-sm font-medium">Coming Soon</div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600 md:text-8xl" style={{ lineHeight: "1.2" }}>
            Promplify
          </p>
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-[#2C106A] to-purple-600">Amplify Your AI Potential</p>
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-gray-700 mb-6 max-w-2xl">Your AI Prompt Management Platform</p>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">We're working hard to bring you the best AI prompt management experience. Be the first to know when we launch!</p>

        <div className="max-w-md mx-auto">
          <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#2C106A] text-gray-800" />
            <Button size="lg" className="bg-[#2C106A] hover:bg-[#2C106A]/90 text-white whitespace-nowrap">
              Notify Me
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-3">We'll notify you when we launch. No spam, we promise!</p>
        </div>
      </div>
    </div>
  );
};
