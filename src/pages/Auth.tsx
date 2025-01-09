import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function Auth() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-[#2C106A]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.svg" alt="Promplify Logo" className="h-8 w-8 mr-2" />
          Promplify
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Promplify has revolutionized how I manage and optimize my AI prompts. The platform's intuitive interface and powerful features have made my workflow significantly more efficient."
            </p>
            <footer className="text-sm">Sofia Davis, AI Researcher</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">
                Choose your preferred sign in method
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-6">
                <Button variant="outline" className="w-full">
                  <FcGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <LoginForm />
                </TabsContent>
                <TabsContent value="register">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-muted-foreground text-center">
                By clicking continue, you agree to our{" "}
                <a href="/terms" className="underline underline-offset-4 hover:text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </a>
                .
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}