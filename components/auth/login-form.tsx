"use client";

import { MailCheckIcon } from "lucide-react";
import { useActionState } from "react";
import { sendMagicLink, type MagicLinkState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState<MagicLinkState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-risk-low-bg text-risk-low">
          <MailCheckIcon className="size-5" aria-hidden />
        </span>
        <p className="font-medium">Check your inbox</p>
        <p className="text-sm text-muted-foreground">
          We sent a sign-in link to <span className="font-medium text-foreground">{state.email}</span>. It expires in one hour.
        </p>
      </div>
    );
  }

  const errorId = "login-error";
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@firm.com"
          defaultValue={state.email}
          required
          aria-invalid={state.status === "error" || undefined}
          aria-describedby={state.status === "error" ? errorId : undefined}
        />
        {state.status === "error" && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
      <SubmitButton pendingLabel="Sending link…">Email me a sign-in link</SubmitButton>
    </form>
  );
}
