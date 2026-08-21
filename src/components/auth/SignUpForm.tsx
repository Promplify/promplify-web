import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackAuthStarted, trackLogin, trackSignUp } from "@/lib/analytics";
import { buildAuthCallbackUrl } from "@/lib/authRedirect";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpFormProps = {
  redirectPath?: string;
};

export function SignUpForm({ redirectPath = "/dashboard" }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    try {
      signUpSchema.parse({ email, password, confirmPassword });
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
    trackAuthStarted("register", "email");

    try {
      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single();

      if (existingUser) {
        toast.error("This email is already registered with SSO. Please sign in with Google or GitHub.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: buildAuthCallbackUrl(window.location.origin, redirectPath),
          data: {
            email_confirmed: false,
          },
        },
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            if (signInError.message.includes("Email not confirmed")) {
              toast.error("Email not verified. Please check your inbox for the verification email.", {
                duration: 6000,
                action: {
                  label: "Resend email",
                  onClick: async () => {
                    const { error: resendError } = await supabase.auth.resend({
                      type: "signup",
                      email,
                      options: {
                        emailRedirectTo: buildAuthCallbackUrl(window.location.origin, redirectPath),
                      },
                    });
                    if (resendError) {
                      toast.error("Failed to send verification email: " + resendError.message);
                    } else {
                      toast.success("Verification email sent. Check your inbox.");
                    }
                  },
                },
              });
            } else {
              toast.error("This email is already registered. Please sign in.");
            }
          } else {
            if (signInData.user) {
              trackLogin("email");
            }
            toast.success("Signed in. Continuing where you left off...");
            navigate(redirectPath);
          }
        } else {
          toast.error("Registration failed: " + error.message);
        }
      } else if (data.user) {
        trackSignUp("email");
        toast.success("Account created. Check your inbox for the verification link.", {
          duration: 6000,
        });
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Unable to create your account. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm sm:text-base">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`h-10 sm:h-11 text-sm sm:text-base ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-xs sm:text-sm text-red-500">{errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm sm:text-base">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={`h-10 sm:h-11 text-sm sm:text-base ${errors.password ? "border-red-500" : ""}`}
        />
        {errors.password && <p className="text-xs sm:text-sm text-red-500">{errors.password}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password" className="text-sm sm:text-base">
          Confirm Password
        </Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={`h-10 sm:h-11 text-sm sm:text-base ${errors.confirmPassword ? "border-red-500" : ""}`}
        />
        {errors.confirmPassword && <p className="text-xs sm:text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
      <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base mt-2" disabled={isLoading}>
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
