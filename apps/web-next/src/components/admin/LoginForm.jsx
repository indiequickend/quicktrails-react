"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Input, Label } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
