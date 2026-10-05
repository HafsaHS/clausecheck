import { BookOpenCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/app/page-shell";

export const metadata: Metadata = { title: "Playbooks" };

export default function PlaybooksPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Playbooks"
        description="Your firm's preferred, fallback and unacceptable positions for each clause type."
      />
      <EmptyState icon={BookOpenCheckIcon} title="No playbooks yet">
        Starter playbooks for SaaS (Customer), Mutual NDA and MSA (Vendor) will appear here, ready to edit.
      </EmptyState>
    </div>
  );
}
