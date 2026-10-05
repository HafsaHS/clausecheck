"use client";

import {
  BookOpenCheckIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  FileTextIcon,
  ListChecksIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  ShieldIcon,
  SunIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { switchOrg } from "@/app/actions/orgs";
import { Logo } from "@/components/brand/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Membership } from "@/lib/auth/active-org";

const ROLE_LABEL: Record<Membership["role"], string> = {
  owner: "Owner",
  attorney: "Attorney",
  reviewer: "Reviewer",
  viewer: "Viewer",
};

export function AppSidebar({
  memberships,
  active,
  userLabel,
}: {
  memberships: Membership[];
  active: Membership;
  userLabel: string;
}) {
  const pathname = usePathname();
  const nav = [
    { href: "/app/contracts", label: "Contracts", icon: FileTextIcon },
    { href: "/app/playbooks", label: "Playbooks", icon: BookOpenCheckIcon },
    { href: "/app/tasks", label: "Tasks", icon: ListChecksIcon },
    ...(active.role === "owner" ? [{ href: "/app/admin", label: "Admin", icon: ShieldIcon }] : []),
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3">
        <Logo href="/app/contracts" tone="inverse" className="px-2 pt-1 text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden" />
        <OrgSwitcher memberships={memberships} active={active} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu userLabel={userLabel} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function OrgSwitcher({ memberships, active }: { memberships: Membership[]; active: Membership }) {
  const [pending, startTransition] = useTransition();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" aria-busy={pending} className="data-[state=open]:bg-sidebar-accent">
              <span
                aria-hidden
                className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-accent font-heading text-sm text-brass"
              >
                {active.orgName.charAt(0)}
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-medium">{active.orgName}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{ROLE_LABEL[active.role]}</span>
              </span>
              <ChevronsUpDownIcon className="ml-auto" aria-hidden />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-60">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Workspaces</DropdownMenuLabel>
            {memberships.map((m) => (
              <DropdownMenuItem
                key={m.orgId}
                disabled={pending}
                onSelect={() => m.orgId !== active.orgId && startTransition(() => switchOrg(m.orgId))}
              >
                <span className="flex-1 truncate">{m.orgName}</span>
                {m.orgId === active.orgId && <CheckIcon aria-label="Current workspace" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function UserMenu({ userLabel }: { userLabel: string }) {
  const { theme, setTheme } = useTheme();
  const [pending, startTransition] = useTransition();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={userLabel} className="data-[state=open]:bg-sidebar-accent">
              <UserIcon aria-hidden />
              <span className="truncate">{userLabel}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-56">
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">{userLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">Theme</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">
                <SunIcon aria-hidden /> Light
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">
                <MoonIcon aria-hidden /> Dark
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">
                <MonitorIcon aria-hidden /> System
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={pending} onSelect={() => startTransition(() => signOut())}>
              <LogOutIcon aria-hidden /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
