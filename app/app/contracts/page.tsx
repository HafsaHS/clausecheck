import { FileTextIcon, UploadIcon } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState, PageHeader } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const metadata: Metadata = { title: "Contracts" };

export default function ContractsPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Contracts"
        description="Upload an NDA, MSA or SaaS agreement to review it against your playbook."
        actions={<UploadButton />}
      />
      <EmptyState icon={FileTextIcon} title="No contracts yet">
        Upload your first contract, or open one of the sample contracts once they&apos;re added to your workspace.
      </EmptyState>
    </div>
  );
}

function UploadButton() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Wrapper keeps the tooltip working on a disabled button. */}
        <span tabIndex={0}>
          <Button disabled>
            <UploadIcon aria-hidden /> Upload contract
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Uploads are switched on with the live review pipeline.</TooltipContent>
    </Tooltip>
  );
}
