import { ApiTokenManager } from "@/components/ApiTokenManager";
import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";

export default function Settings() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto p-6">
        <SEO canonicalPath="/settings" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ApiTokenManager />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
