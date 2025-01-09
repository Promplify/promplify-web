import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@example.com" />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="/reset-password" className="text-sm text-muted-foreground hover:text-primary">
            Forgot password?
          </a>
        </div>
        <Input id="password" type="password" />
      </div>
      <Button className="w-full">Sign in</Button>
    </div>
  );
}