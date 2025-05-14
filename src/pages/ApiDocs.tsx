import { Footer } from "@/components/landing/Footer";
import { Navigation } from "@/components/landing/Navigation";
import { SEO } from "@/components/SEO";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function ApiDocs() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navigation />
      <main className="flex-1 container mx-auto p-6 pt-24">
        <SEO canonicalPath="/api-docs" />
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">API Documentation</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-4xl font-bold mb-8 text-white">API</h1>
          <div className="space-y-12">
            <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Overview</h2>
              <p className="text-gray-300 leading-relaxed text-lg">
                The Promplify API allows you to programmatically access your prompts. This API is designed to be simple and straightforward to use.
              </p>
            </section>

            <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Authentication</h2>
              <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                All API requests require authentication using a Bearer token. You can generate an API token in your{" "}
                <a href="/settings" className="text-purple-400 hover:text-purple-300 underline">
                  Settings
                </a>{" "}
                page.
              </p>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <pre className="m-0 rounded-lg font-mono text-sm text-gray-300">
                  <span className="text-purple-400">Authorization:</span> Bearer your-api-token
                </pre>
              </div>
            </section>

            <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">Endpoints</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-medium mb-4 text-purple-400">Get Prompt</h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <pre className="m-0 rounded-lg font-mono text-sm text-gray-300">
                        <span className="text-green-400">GET</span> https://api.promplify.com/prompts/<span className="text-yellow-400">{`{promptId}`}</span>?version=
                        <span className="text-yellow-400">{`{version}`}</span>
                      </pre>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2 text-gray-300">Parameters:</h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1 text-lg">
                        <li>promptId (path parameter) - The UUID of the prompt you want to retrieve</li>
                        <li>version (query parameter, optional) - The specific version of the prompt to retrieve (e.g., "1.0.0"). If not provided, returns the latest version.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2 text-gray-300">Headers:</h4>
                      <ul className="list-disc list-inside text-gray-300 space-y-1 text-lg">
                        <li>Authorization: Bearer your-api-token</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2 text-gray-300">Response:</h4>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <pre className="m-0 rounded-lg font-mono text-sm text-gray-300 overflow-x-auto">
                          {`{
  "title": "string",
  "description": "string",
  "content": "string",
  "version": "string",
  "token_count": "number",
  "performance": "number",
  "is_favorite": "boolean",
  "model": "string",
  "temperature": "number",
  "max_tokens": "number",
  "created_at": "string (ISO date)",
  "updated_at": "string (ISO date)",
  "system_prompt": "string",
  "user_prompt": "string",
  "system_tokens": "number",
  "user_tokens": "number"
}`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium mb-2 text-gray-300">Examples:</h4>
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-gray-300 mb-2 text-sm">Get latest version:</p>
                          <pre className="m-0 rounded-lg font-mono text-sm text-gray-300">
                            <span className="text-green-400">curl</span> --location <span className="text-yellow-400">'https://api.promplify.com/prompts/E72BD69E-A116-497F-94C4-7DE6606A77BE'</span> \
                            <br />
                            --header <span className="text-yellow-400">'Authorization: Bearer your-api-token'</span>
                          </pre>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <p className="text-gray-300 mb-2 text-sm">Get specific version:</p>
                          <pre className="m-0 rounded-lg font-mono text-sm text-gray-300">
                            <span className="text-green-400">curl</span> --location{" "}
                            <span className="text-yellow-400">'https://api.promplify.com/prompts/E72BD69E-A116-497F-94C4-7DE6606A77BE?version=2.1.0'</span> \
                            <br />
                            --header <span className="text-yellow-400">'Authorization: Bearer your-api-token'</span>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-semibold mb-6 text-white">Error Responses</h2>
              <div className="grid gap-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-red-400">400 Bad Request</h4>
                  <p className="text-gray-300 text-lg">Prompt ID is required</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-red-400">401 Unauthorized</h4>
                  <p className="text-gray-300 text-lg">Authorization header is required or Invalid token</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-red-400">404 Not Found</h4>
                  <p className="text-gray-300 text-lg">Prompt not found</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-red-400">405 Method Not Allowed</h4>
                  <p className="text-gray-300 text-lg">Only GET requests are supported</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="text-lg font-medium text-red-400">500 Internal Server Error</h4>
                  <p className="text-gray-300 text-lg">An unexpected error occurred</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
