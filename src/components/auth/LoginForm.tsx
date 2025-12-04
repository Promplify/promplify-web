import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { [key: string]: string } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Your email is not verified. Please check your inbox to complete verification.", {
            duration: 6000,
            action: {
              label: "Resend verification email",
              onClick: async () => {
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: "signup",
                    email: data.email,
                  });
                  if (resendError) {
                    toast.error("Failed to send verification email: " + resendError.message);
                    return;
                  }
                  toast.success("Verification email has been resent, please check your inbox");
                } catch (error) {
                  console.error("Error resending verification email:", error);
                }
              },
            },
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Email or password is incorrect, please try again");
        } else {
          toast.error("Login failed: " + error.message);
        }
      } else if (data.user) {
        toast.success("Login successful! Redirecting to dashboard...");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login, please try again later");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm sm:text-base">
          Email
        </Label>
        <Input
          id="email"
          placeholder="m@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 sm:h-11 text-sm sm:text-base"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm sm:text-base">
            Password
          </Label>
          <Link to="/reset-password" className="text-xs sm:text-sm text-[#2C106A] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 sm:h-11 text-sm sm:text-base" />
      </div>
      <Button type="submit" className="w-full bg-[#2C106A] hover:bg-[#1F0B4C] h-10 sm:h-11 text-sm sm:text-base" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
