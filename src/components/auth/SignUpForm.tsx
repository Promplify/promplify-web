import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="name@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input id="confirm-password" type="password" />
      </div>
      <Button className="w-full">Create account</Button>
    </div>
  );
}