import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
          toast.error("您的邮箱尚未验证。请检查邮箱完成验证后再登录。", {
            duration: 6000,
            action: {
              label: "重新发送验证邮件",
              onClick: async () => {
                try {
                  const { error: resendError } = await supabase.auth.resend({
                    type: "signup",
                    email,
                    options: {
                      emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                  });
                  if (resendError) {
                    toast.error("发送验证邮件失败: " + resendError.message);
                  } else {
                    toast.success("验证邮件已重新发送，请查收");
                  }
                } catch (err) {
                  console.error("重发验证邮件错误:", err);
                  toast.error("发送验证邮件时发生错误");
                }
              },
            },
          });
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("邮箱或密码错误，请重试");
        } else {
          toast.error("登录失败: " + error.message);
        }
      } else if (data.user) {
        toast.success("登录成功！正在跳转到仪表盘...");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("登录错误:", error);
      toast.error("登录过程中发生错误，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-base">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`h-12 text-base ${errors.email ? "border-red-500" : ""}`}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-base">
            Password
          </Label>
          <a href="/reset-password" className="text-sm text-muted-foreground hover:text-primary">
            Forgot password?
          </a>
        </div>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={`h-12 text-base ${errors.password ? "border-red-500" : ""}`} />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
      </div>
      <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
