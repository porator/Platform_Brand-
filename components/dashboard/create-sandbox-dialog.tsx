"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { IconCopy, IconSquareDashed } from "@/lib/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSandboxes } from "@/components/dashboard/providers";
import { makeSandboxId, projectHref, SANDBOX_PALETTE, type Environment } from "@/lib/newgen";

/** One "starting configuration" choice (Blank / Copy from …). */
/** A starting configuration: the radio, an icon tile (a dashed page for Blank; a copy icon in the environment's colour
 *  for a copy), the label and a line on what you get. */
function SourceOption({
  value,
  color,
  icon: Icon,
  hint,
  children,
}: {
  value: string;
  color?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Label className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-3 py-2.5 text-sm has-[[data-checked]]:border-primary has-[[data-checked]]:bg-muted/50">
      <RadioGroupItem value={value} />
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background"
        style={color ? { color, background: `${color}14`, borderColor: `${color}33` } : undefined}
      >
        <Icon className={cn("size-4", !color && "text-muted-foreground")} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">{children}</span>
        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
      </span>
    </Label>
  );
}

/**
 * Create-sandbox flow (name → starting config → created → landed in it), modelled
 * on Stripe/Vercel/Render. On create, the sandbox is added to the project's
 * runtime list, the user is routed into it, and the top sandbox bar shows it.
 */
export function CreateSandboxDialog({
  open,
  onOpenChange,
  projectId,
  sectionId,
  environments,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  sectionId: string;
  environments: Environment[];
}) {
  const router = useRouter();
  const { add } = useSandboxes();
  const [name, setName] = React.useState("");
  const [source, setSource] = React.useState("production");

  const sandboxes = environments.filter((e) => e.kind === "sandbox");

  const reset = () => {
    setName("");
    setSource("production");
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    // R22: a colour no other sandbox of this project has yet (then round again).
    const color = SANDBOX_PALETTE.find((c) => !sandboxes.some((e) => e.color === c)) ?? SANDBOX_PALETTE[sandboxes.length % SANDBOX_PALETTE.length];
    const env: Environment = { id: makeSandboxId(trimmed), name: trimmed, kind: "sandbox", color };
    add(projectId, env);
    reset();
    onOpenChange(false);
    router.push(projectHref(projectId, sectionId, env.id));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create sandbox</DialogTitle>
          <DialogDescription>
            A sandbox is an isolated copy of this project for safe testing. Changes here don’t affect production.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sandbox-name">Name</Label>
            <Input
              id="sandbox-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. QA, Marketing, Hotfix"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Starting configuration</Label>
            <RadioGroup value={source} onValueChange={setSource}>
              {/* Start from scratch, set apart from the copies below. */}
              <SourceOption value="blank" icon={IconSquareDashed} hint="An empty sandbox: no settings or content yet.">
                Blank
              </SourceOption>
              <div className="my-1 flex items-center gap-3 text-xs text-muted-foreground" aria-hidden>
                <span className="h-px flex-1 bg-border" />
                or copy an environment
                <span className="h-px flex-1 bg-border" />
              </div>
              <SourceOption value="production" color="#16a34a" icon={IconCopy} hint="Its settings and content, as they are now.">
                Copy from Production
              </SourceOption>
              {sandboxes.map((s) => (
                <SourceOption key={s.id} value={s.id} color={s.color} icon={IconCopy} hint="Its settings and content, as they are now.">
                  Copy from {s.name}
                </SourceOption>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={create} disabled={!name.trim()}>
            Create sandbox
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
