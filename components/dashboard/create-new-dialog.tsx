"use client";

import * as React from "react";
import {
  IconBuilding,
  IconDeviceGamepad2,
  IconFolders,
  IconBuildingStore,
  IconCreditCard,
  IconStack2,
  IconChevronLeft,
  IconCheck,
  IconBuildingSkyscraper,
  IconCornerDownRight,
  type IconProps,
} from "@/lib/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLaunchPlan } from "@/components/dashboard/providers";
import { cn } from "@/lib/utils";

/** A selectable option row, shared across the create flows. */
export function SelectCard({
  selected,
  onClick,
  icon: Icon,
  label,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ComponentType<IconProps>;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        selected ? "border-foreground/40 bg-muted" : "border-border hover:bg-muted/60"
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md",
          selected ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
      <IconCheck
        className={cn("size-4 shrink-0 text-foreground transition-opacity", selected ? "opacity-100" : "opacity-0")}
        aria-hidden
      />
    </button>
  );
}

type Kind = "studio" | "game" | "project";
type Contains = "game" | "project";
type Direction = "webstore" | "checkout" | "both";
type Screen = "kind" | "contains" | "direction";

type Opt<T extends string> = {
  id: T;
  label: string;
  description: string;
  icon: React.ComponentType<IconProps>;
};

const KIND_OPTS: Opt<Kind>[] = [
  { id: "studio", label: "Studio", description: "A group of games and their store projects.", icon: IconBuilding },
  { id: "game", label: "Game", description: "A game with one or more store projects.", icon: IconDeviceGamepad2 },
  { id: "project", label: "Project", description: "A single store project — Webstore or Checkout.", icon: IconFolders },
];

const CONTAINS_OPTS: Opt<Contains>[] = [
  { id: "game", label: "Game", description: "Add a first game to the new studio.", icon: IconDeviceGamepad2 },
  { id: "project", label: "Project", description: "Add a project directly to the new studio.", icon: IconFolders },
];

const DIRECTION_OPTS: Opt<Direction>[] = [
  { id: "webstore", label: "Webstore", description: "A full web storefront.", icon: IconBuildingStore },
  { id: "checkout", label: "Checkout", description: "A direct, link-based checkout flow.", icon: IconCreditCard },
  { id: "both", label: "Both", description: "A webstore and a direct checkout together.", icon: IconStack2 },
];

const DIRECTION_LABEL: Record<Direction, string> = {
  webstore: "Webstore",
  checkout: "Checkout",
  both: "Webstore + Checkout",
};

type NodeState = "done" | "active" | "upcoming";
type TreeNode = { icon: React.ComponentType<IconProps>; type: string; value: string; state: NodeState };

/** Live hierarchy preview — shows where the new item lands under the company and
 *  what nests beneath it, highlighting whatever the current step is about. */
function CreateTree({
  companyName,
  kind,
  name,
  contains,
  containsName,
  direction,
  screen,
}: {
  companyName: string;
  kind: Kind | null;
  name: string;
  contains: Contains | null;
  containsName: string;
  direction: Direction | null;
  screen: Screen;
}) {
  const dir = direction ? DIRECTION_LABEL[direction] : "Webstore or Checkout";
  const storeState: NodeState = screen === "direction" ? "active" : direction ? "done" : "upcoming";

  const nodes: TreeNode[] = [
    { icon: IconBuildingSkyscraper, type: "Company", value: companyName, state: "done" },
  ];
  if (kind === "studio") {
    nodes.push({ icon: IconBuilding, type: "Studio", value: name.trim() || "New studio", state: screen === "kind" ? "active" : "done" });
    nodes.push({
      icon: contains === "project" ? IconFolders : IconDeviceGamepad2,
      type: contains === "project" ? "Project" : "Game",
      value: contains
        ? contains === "project"
          ? "New project"
          : containsName.trim() || "New game"
        : "Game or project",
      state: screen === "contains" ? "active" : contains ? "done" : "upcoming",
    });
    nodes.push({ icon: IconBuildingStore, type: "Store", value: dir, state: storeState });
  } else if (kind === "game") {
    nodes.push({ icon: IconDeviceGamepad2, type: "Game", value: name.trim() || "New game", state: screen === "kind" ? "active" : "done" });
    nodes.push({ icon: IconFolders, type: "Project", value: "New project", state: storeState });
    nodes.push({ icon: IconBuildingStore, type: "Store", value: dir, state: storeState });
  } else if (kind === "project") {
    nodes.push({ icon: IconFolders, type: "Project", value: "New project", state: screen === "kind" ? "active" : "done" });
    nodes.push({ icon: IconBuildingStore, type: "Store", value: dir, state: storeState });
  } else {
    nodes.push({ icon: IconCornerDownRight, type: "", value: "Pick what to create", state: "upcoming" });
  }

  return (
    <aside className="rounded-xl border border-border bg-muted/30 p-3 sm:mt-7">
      <p className="mb-3 px-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Where it lands</p>
      <div className="flex flex-col gap-1">
        {nodes.map((n, i) => (
          <div key={i} style={{ marginInlineStart: i === 0 ? 0 : (i - 1) * 14 + 2 }} className="flex items-center gap-1.5">
            {i > 0 ? <IconCornerDownRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden /> : null}
            <div
              className={cn(
                "flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                n.state === "active" && "border-2 border-foreground/40 bg-muted",
                n.state === "upcoming" && "opacity-55",
              )}
            >
              <n.icon className={cn("size-4 shrink-0", n.state === "active" ? "text-foreground" : "text-muted-foreground")} aria-hidden />
              <span className="min-w-0 flex-1">
                {n.type ? <span className="block text-[10px] tracking-wide text-muted-foreground uppercase">{n.type}</span> : null}
                <span className="block truncate text-[13px] font-medium text-foreground">{n.value}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

/**
 * The company switcher's "Create new" opens this branching wizard, following the
 * Company › Studio › Game › Project › store hierarchy:
 *  - Studio  → what it should contain (Game / Project) → store direction
 *  - Game    → store direction
 *  - Project → store direction
 */
export function CreateNewDialog({
  open,
  onOpenChange,
  companyName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyName: string;
}) {
  const [kind, setKind] = React.useState<Kind | null>(null);
  // The name for a new Studio or Game (asked before Continue activates).
  const [name, setName] = React.useState("");
  const needsName = kind === "studio" || kind === "game";
  const [contains, setContains] = React.useState<Contains | null>(null);
  // The name for the Game created inside a new studio (contains === "game").
  const [containsName, setContainsName] = React.useState("");
  const [direction, setDirection] = React.useState<Direction | null>(null);
  const [index, setIndex] = React.useState(0);
  const launch = useLaunchPlan();

  const steps = React.useMemo<Screen[]>(() => {
    if (kind === "studio") return ["kind", "contains", "direction"];
    if (kind === "game" || kind === "project") return ["kind", "direction"];
    return ["kind"];
  }, [kind]);

  const screen: Screen = steps[index] ?? "kind";
  const isLast = index === steps.length - 1;

  const reset = () => {
    setKind(null);
    setName("");
    setContains(null);
    setContainsName("");
    setDirection(null);
    setIndex(0);
  };
  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) reset();
  };

  const canAdvance =
    screen === "kind"
      ? needsName
        ? name.trim().length > 0
        : !!kind
      : screen === "contains"
        ? contains === "game"
          ? containsName.trim().length > 0
          : !!contains
        : !!direction;

  const next = () => {
    if (isLast) {
      // Store is set up — unlock the launch plan and show it.
      const created = containsName.trim() || name.trim();
      launch.start(created ? `${created} · ${companyName}` : companyName);
      close(false);
      return;
    }
    setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  const stepBadge = <p className="text-xs font-medium text-muted-foreground">Step {index + 1} of {steps.length}</p>;

  const footer =
    screen === "kind" ? (
      <DialogFooter>
        <Button variant="ghost" onClick={() => close(false)}>
          Cancel
        </Button>
        <Button disabled={!canAdvance} onClick={next}>
          Continue
        </Button>
      </DialogFooter>
    ) : (
      <DialogFooter className="sm:justify-between">
        <Button variant="ghost" onClick={back}>
          <IconChevronLeft className="size-4" />
          Back
        </Button>
        <Button disabled={!canAdvance} onClick={next}>
          {isLast ? "Create" : "Continue"}
        </Button>
      </DialogFooter>
    );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-3xl">
        <div className="grid gap-6 sm:grid-cols-[1fr_240px]">
          <div className="flex min-w-0 flex-col gap-4">
            {screen === "kind" ? (
              <>
                <DialogHeader>
                  {stepBadge}
                  <DialogTitle>What would you like to create?</DialogTitle>
                  <DialogDescription>Add to {companyName}.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2" role="radiogroup" aria-label="What would you like to create?">
                  {KIND_OPTS.map((o) => (
                    <SelectCard
                      key={o.id}
                      selected={kind === o.id}
                      onClick={() => {
                        setKind(o.id);
                        setName("");
                        setContains(null);
                        setDirection(null);
                      }}
                      icon={o.icon}
                      label={o.label}
                      description={o.description}
                    />
                  ))}
                </div>
                {/* A new Studio or Game needs a name before you can continue. */}
                {needsName ? (
                  <div className="grid gap-2">
                    <Label htmlFor="new-item-name">{kind === "studio" ? "Studio name" : "Game name"}</Label>
                    <Input
                      id="new-item-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={kind === "studio" ? "e.g. Evergreen" : "e.g. Heart of Vegas"}
                      autoFocus
                    />
                  </div>
                ) : null}
              </>
            ) : screen === "contains" ? (
              <>
                <DialogHeader>
                  {stepBadge}
                  <DialogTitle>What should the studio contain?</DialogTitle>
                  <DialogDescription>Create a first game or project inside the new studio.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2" role="radiogroup" aria-label="What should the studio contain?">
                  {CONTAINS_OPTS.map((o) => (
                    <SelectCard
                      key={o.id}
                      selected={contains === o.id}
                      onClick={() => {
                        setContains(o.id);
                        setContainsName("");
                      }}
                      icon={o.icon}
                      label={o.label}
                      description={o.description}
                    />
                  ))}
                </div>
                {/* A new game needs a name before you can continue. */}
                {contains === "game" ? (
                  <div className="grid gap-2">
                    <Label htmlFor="new-game-name">Game name</Label>
                    <Input
                      id="new-game-name"
                      value={containsName}
                      onChange={(e) => setContainsName(e.target.value)}
                      placeholder="e.g. Heart of Vegas"
                      autoFocus
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <DialogHeader>
                  {stepBadge}
                  <DialogTitle>Set up the store</DialogTitle>
                  <DialogDescription>Choose what this project includes.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2" role="radiogroup" aria-label="Set up the store">
                  {DIRECTION_OPTS.map((o) => (
                    <SelectCard
                      key={o.id}
                      selected={direction === o.id}
                      onClick={() => setDirection(o.id)}
                      icon={o.icon}
                      label={o.label}
                      description={o.description}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <CreateTree
            companyName={companyName}
            kind={kind}
            name={name}
            contains={contains}
            containsName={containsName}
            direction={direction}
            screen={screen}
          />
        </div>
        {footer}
      </DialogContent>
    </Dialog>
  );
}
