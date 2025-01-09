import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少需要6个字符"),
  confirmPassword: z.string().min(6, "确认密码至少需要6个字符"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不匹配",
  path: ["confirmPassword"],
});

export function SignUpForm() {
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
    console.log("Signup attempt with email:", email);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log("Signup response:", { data, error });

      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("该邮箱已被注册");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("注册成功！请查收邮件以确认您的账户");
        navigate("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("注册过程中发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">邮箱</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">密码</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">确认密码</Label>
        <Input 
          id="confirm-password" 
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "创建账户中..." : "创建账户"}
      </Button>
    </form>
  );
}