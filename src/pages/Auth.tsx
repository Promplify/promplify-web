import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Logo } from "@/components/landing/Logo";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { updateMeta } from "@/utils/meta";
import { ArrowLeft, Github } from "lucide-react";
import { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  useEffect(() => {
    updateMeta("Sign In", "Sign in or create an account to start managing your AI prompts with Promplify.", "sign in, login, register, account, AI prompt management");
  }, []);

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`An error occurred during ${provider} login`);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      <SEO
        canonicalPath="/auth"
        title="Sign In - Promplify"
        description="Sign in or create an account to start managing your AI prompts with Promplify."
        keywords="sign in, login, register, account, AI prompt management"
      />
      <meta name="robots" content="noindex, nofollow" />

      {/* Simple navigation header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <Logo />
            </Link>
            <Link to="/" className="text-white/70 hover:text-white transition-colors inline-flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container relative flex-col items-center justify-center lg:grid lg:max-w-none lg:grid-cols-[2fr_3fr] lg:px-0 pt-16">
        {/* Left side promotional content - hidden on mobile */}
        <div className="relative hidden h-screen flex-col bg-muted p-8 text-white lg:flex dark:border-r">
          <div className="absolute inset-0 bg-[#000000]" />
          <div className="relative z-20 flex items-center text-2xl font-medium pt-4">
            <Link to="/">
              <img src="/logo.svg" alt="Promplify Logo" className="h-12 w-auto mr-3" />
            </Link>
          </div>
          <div className="relative z-20 mt-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Welcome to Promplify</h1>
              <p className="text-lg text-white/80">Your AI prompt management platform. Create, organize, and optimize your prompts with ease.</p>
            </div>
            <div className="mt-12 space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Streamline Your Workflow</h3>
                  <p className="text-white/70">Manage all your AI prompts in one place</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Version Control</h3>
                  <p className="text-white/70">Track and improve your prompts over time</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Secure Storage</h3>
                  <p className="text-white/70">Your prompts are safe with us</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-base italic text-white/90">
                "Promplify has revolutionized how I manage and optimize my AI prompts. The platform's intuitive interface and powerful features have made my workflow significantly more efficient."
              </p>
              <footer className="text-sm text-white/70">Sofia Davis, AI Researcher</footer>
            </blockquote>
          </div>
        </div>

        {/* Right side auth form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          <div className="w-full max-w-[480px] sm:max-w-[520px]">
            <Card className="p-4 sm:p-6 md:p-8 shadow-xl">
              <CardHeader className="space-y-2 pb-4 sm:pb-6 px-0">
                <CardTitle className="text-2xl sm:text-3xl text-center font-bold">Welcome Back</CardTitle>
                <CardDescription className="text-center text-sm sm:text-base">Choose your preferred sign-in method</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 sm:gap-8 px-0">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Button variant="outline" size="lg" className="w-full h-10 sm:h-12 text-sm sm:text-base" onClick={() => handleSocialLogin("google")}>
                    <FcGoogle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Google</span>
                    <span className="sm:hidden">Google</span>
                  </Button>
                  <Button variant="outline" size="lg" className="w-full h-10 sm:h-12 text-sm sm:text-base" onClick={() => handleSocialLogin("github")}>
                    <Github className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">Github</span>
                    <span className="sm:hidden">Github</span>
                  </Button>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="bg-background px-3 sm:px-4 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-10 sm:h-12 mb-2">
                    <TabsTrigger value="login" className="text-sm sm:text-base">
                      Login
                    </TabsTrigger>
                    <TabsTrigger value="register" className="text-sm sm:text-base">
                      Register
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="register">
                    <SignUpForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-4 px-0">
                <div className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed">
                  By clicking continue, you agree to our{" "}
                  <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </a>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
