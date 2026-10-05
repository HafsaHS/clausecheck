"use client";

import { useActionState } from "react";
import { createOrg, type CreateOrgState } from "@/app/actions/orgs";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateOrgForm() {
  const [state, formAction] = useActionState<CreateOrgState, FormData>(createOrg, {});
  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="org-name">Firm or team name</Label>
        <Input
          id="org-name"
          name="name"
          placeholder="e.g. Whitlock & Rao LLP"
          maxLength={80}
          required
          aria-invalid={state.message ? true : undefined}
          aria-describedby={state.message ? "org-error" : undefined}
        />
        {state.message && (
          <p id="org-error" role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
      <SubmitButton pendingLabel="Creating…">Create workspace</SubmitButton>
    </form>
  );
}
