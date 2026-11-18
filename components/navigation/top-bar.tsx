"use client";

import * as React from "react";
import {
  IconSelector,
  IconSearch,
  IconBell,
  IconPlus,
  IconCheck,
  IconCircleFilled,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import { PageShell, PageHeader, Section, Mono, A11yList } from "@/components/atoms/_kit";

const ENVS = [
  { name: "Production", tone: "text-success" },
  { name: "Staging", tone: "text-warning" },
  { name: "Development", tone: "text-muted-foreground" },
];

export function ProjectSwitcher({ value = "Project Alpha" }: { value?: string }) {
  const [project, setProject] = React.useState(value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="gap-1.5 font-medium" />}
      >
        {project}
        <IconSelector className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Switch project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {["Project Alpha", "Project Beta", "Project Gamma"].map((p) => (
          <DropdownMenuItem key={p} onClick={() => setProject(p)}>
            {p}
            {p === project ? <IconCheck className="ml-auto size-4" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function EnvironmentSwitcher({ value = "Production" }: { value?: string }) {
  const [env, setEnv] = React.useState(value);
  const current = ENVS.find((e) => e.name === env) ?? ENVS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="gap-1.5 font-medium" />}
      >
        <IconCircleFilled className={cn("size-2.5", current.tone)} aria-hidden />
        {env}
        <IconSelector className="size-4 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Environment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ENVS.map((e) => (
          <DropdownMenuItem key={e.name} onClick={() => setEnv(e.name)}>
            <IconCircleFilled className={cn("size-2.5", e.tone)} aria-hidden />
            {e.name}
            {e.name === env ? <IconCheck className="ml-auto size-4" aria-hidden /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu" />}
      >
        <Avatar size="sm">
          <AvatarFallback>PR</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>
          <div className="grid">
            <span className="text-sm font-medium">Pat Rivera</span>
            <span className="text-xs font-normal text-muted-foreground">pat@appcharge.com</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Account</DropdownMenuItem>
        <DropdownMenuItem>Preferences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopSearch() {
  const [q, setQ] = React.useState("");
  return (
    <InputGroup className="hidden h-8 w-full max-w-64 md:flex">
      <InputGroupAddon>
        <IconSearch aria-hidden />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        placeholder="Search…"
        aria-label="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </InputGroup>
  );
}

export function TopBar({
  left,
  title,
  showSearch = true,
  className,
}: {
  left?: React.ReactNode;
  title?: React.ReactNode;
  showSearch?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex h-14 w-full items-center gap-3 border-b border-border bg-background px-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">{left}</div>
      {title ? (
        <>
          <Separator orientation="vertical" className="h-5" />
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
        </>
      ) : null}
      <div className="ml-auto flex items-center gap-2">
        {showSearch ? <TopSearch /> : null}
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          <IconPlus />
          New
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <IconBell />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}

export function TopBarPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Navigation"
        title="Top Bar"
        description={
          <>
            The horizontal application header. It composes the current context — project and
            environment selectors, page title, search, actions, notifications and the user menu —
            and sits above the content next to the sidebar.
          </>
        }
      />

      <Section
        title="Context: project + environment + page"
        description="The most important composition — which project, which environment, and where you are."
      >
        <div className="overflow-hidden rounded-md border border-border">
          <TopBar
            left={
              <>
                <ProjectSwitcher />
                <EnvironmentSwitcher />
              </>
            }
            title="Builds"
          />
        </div>
      </Section>

      <Section title="Minimal" description="Just a title and the user menu — for focused or full-width pages.">
        <div className="overflow-hidden rounded-md border border-border">
          <TopBar title="Settings" showSearch={false} left={null} />
        </div>
      </Section>

      <Section
        title="With search emphasis"
        description="Search can take the lead on list-heavy surfaces."
      >
        <div className="overflow-hidden rounded-md border border-border">
          <TopBar left={<ProjectSwitcher />} />
        </div>
      </Section>

      <Section title="Accessibility">
        <A11yList
          items={[
            <>
              The bar is a <Mono>&lt;header&gt;</Mono> landmark; selectors and the user menu are
              labelled menu buttons with <Mono>aria-expanded</Mono>.
            </>,
            "All actions are keyboard reachable; icon-only buttons (notifications, account) have labels.",
            "Menus trap focus while open and restore it to the trigger on close.",
            "Environment status is shown with a dot and its name — never color alone.",
          ]}
        />
      </Section>
    </PageShell>
  );
}
