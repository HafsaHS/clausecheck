import { ListChecksIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/app/page-shell";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader title="Review tasks" description="Questions and clauses escalated to an attorney." />
      <EmptyState icon={ListChecksIcon} title="No open escalations">
        When a reviewer escalates an answer or a clause, it lands here for an attorney to resolve.
      </EmptyState>
    </div>
  );
}
