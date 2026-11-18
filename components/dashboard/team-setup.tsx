"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  IconPlus,
  IconRefresh,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Access } from "@/lib/folders";
import { cn } from "@/lib/utils";
import { BrandDNA } from "@/components/brand-dna/brand-dna";
import { AppchargeLogo } from "@/components/dashboard/logo";
import { participantName } from "@/lib/usability-session";
import type { BrandContext } from "@/components/brand-dna/use-brand-context";

/*
 * First-time team setup (project Overview): a project with no teammates shows "Set up your team"; inviting opens a
 * modal for several emails, each with a role; once anyone is invited, the card becomes People with access, where each
 * invitation is Pending, Accepted or Expired. Invitations live in this session (a prototype store, below); a real
 * invitations API plugs in at `sendInvites` / `resendInvite` / `revokeInvite`.
 */

export type InviteRole = "Admin" | "Developer" | "Finance" | "Viewer";
export const INVITE_ROLES: { id: InviteRole; description: string }[] = [
  { id: "Admin", description: "Full project access" },
  {
    id: "Developer",
    description: "Technical configuration, APIs and integrations",
  },
  { id: "Finance", description: "Financial settings and payments" },
  { id: "Viewer", description: "Read-only access" },
];
export type InviteStatus = "pending" | "accepted" | "expired";
export type Invite = {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  sentAt: number;
};

const INVITE_TTL = 7 * 24 * 60 * 60 * 1000; // invitations expire after 7 days

/* ── Session store: invitations per project ─────────────────────────────────────────────────────────────────────── */
const store = new Map<string, Invite[]>();
const listeners = new Set<() => void>();
const EMPTY: Invite[] = [];
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const update = (projectId: string, fn: (list: Invite[]) => Invite[]) => {
  store.set(projectId, fn(store.get(projectId) ?? []));
  emit();
};
/** An invitation past its 7 days reads as expired. */
const effective = (i: Invite): Invite =>
  i.status === "pending" && Date.now() - i.sentAt > INVITE_TTL
    ? { ...i, status: "expired" }
    : i;

export function useInvites(projectId: string) {
  const list = React.useSyncExternalStore(
    subscribe,
    () => store.get(projectId) ?? EMPTY,
    () => EMPTY,
  );
  return list.map(effective);
}

export function sendInvites(
  projectId: string,
  rows: { email: string; role: InviteRole }[],
) {
  const now = Date.now();
  const sent = rows.map((r, i) => ({
    id: `${now}-${i}`,
    email: r.email,
    role: r.role,
    status: "pending" as const,
    sentAt: now,
  }));
  update(projectId, (list) => [...list, ...sent]);
  // Prototype: the first person accepts a few seconds later, so the Accepted state can be seen.
  const first = sent[0];
  if (first)
    window.setTimeout(() => {
      update(projectId, (list) =>
        list.map((i) =>
          i.id === first.id && i.status === "pending"
            ? { ...i, status: "accepted" }
            : i,
        ),
      );
      toast(`${first.email} joined the project`, {
        description: `As ${first.role}`,
      });
    }, 6000);
}
export const resendInvite = (projectId: string, id: string) =>
  update(projectId, (list) =>
    list.map((i) =>
      i.id === id ? { ...i, status: "pending", sentAt: Date.now() } : i,
    ),
  );
export const revokeInvite = (projectId: string, id: string) =>
  update(projectId, (list) => list.filter((i) => i.id !== id));

/* ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AVATAR_COLORS = [
  "#4F46E5",
  "#0D9488",
  "#DB2777",
  "#EA580C",
  "#2563EB",
  "#7C3AED",
];
const initials = (nameOrEmail: string) => {
  const base = nameOrEmail.includes("@")
    ? nameOrEmail.split("@")[0].replace(/[._-]+/g, " ")
    : nameOrEmail;
  return base
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
const ago = (t: number) => {
  const m = Math.round((Date.now() - t) / 60000);
  return m < 1
    ? "just now"
    : m < 60
      ? `${m} min ago`
      : m < 1440
        ? `${Math.round(m / 60)} h ago`
        : `${Math.round(m / 1440)} d ago`;
};
function Avatar({
  label,
  index,
  dashed,
}: {
  label: string;
  index: number;
  dashed?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
        dashed &&
          "border border-dashed border-foreground/25 bg-background text-muted-foreground",
      )}
      style={
        dashed
          ? undefined
          : { background: AVATAR_COLORS[index % AVATAR_COLORS.length] }
      }
    >
      {label}
    </span>
  );
}

const CARD =
  "overflow-hidden rounded-2xl border border-border bg-card shadow-card";

/* ── The card: Team Setup (first time) or People with access ──────────────────────────────────────────────────────── */
export function TeamSection({
  projectId,
  projectName,
  firstTime,
  inherited,
  brand,
}: {
  projectId: string;
  projectName: string;
  /** A new project with nobody on it yet: show "Set up your team" until someone is invited. */
  firstTime: boolean;
  /** People who already have access through the folders above (not on a first-time project). */
  inherited: Access[];
  /** The project's brand, for the invite modal's visual panel (Brand DNA). Neutral without it. */
  brand?: BrandContext;
}) {
  const invites = useInvites(projectId);
  const [open, setOpen] = React.useState(false);
  const taken = React.useMemo(
    () => new Set(invites.map((i) => i.email.toLowerCase())),
    [invites],
  );
  const dialog = (
    <InviteDialog
      open={open}
      onOpenChange={setOpen}
      projectId={projectId}
      projectName={projectName}
      taken={taken}
      brand={brand}
    />
  );

  if (firstTime && invites.length === 0)
    return (
      <>
        <TeamSetupEmpty onInvite={() => setOpen(true)} />
        {dialog}
      </>
    );
  return (
    <>
      <PeopleTable
        projectId={projectId}
        firstTime={firstTime}
        inherited={inherited}
        invites={invites}
        onInvite={() => setOpen(true)}
      />
      {dialog}
    </>
  );
}

/** First time: what the team is for, one button, and a quiet "nobody yet". */
function TeamSetupEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <section
      className={cn(
        CARD,
        "flex flex-col gap-4 p-5 sm:flex-row sm:items-center",
      )}
      aria-labelledby="team-setup-title"
    >
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
      >
        <IconUsers className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2
          id="team-setup-title"
          className="text-sm font-semibold text-foreground"
        >
          Set up your team
        </h2>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
          Invite your teammates to help configure and launch your Webstore. Give
          each person the right level of access.
        </p>
        {/* Nobody invited yet: three empty seats. */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="size-6 rounded-full border border-dashed border-foreground/25 bg-background"
              />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">
            No teammates invited yet
          </span>
        </div>
      </div>
      <Button
        size="sm"
        className="h-8 shrink-0 self-start px-3 text-nav sm:self-center"
        onClick={onInvite}
      >
        <IconUserPlus />
        Invite teammates
      </Button>
    </section>
  );
}

const STATUS: Record<
  InviteStatus,
  { label: string; variant: "warning" | "success" | "destructive" }
> = {
  pending: { label: "Pending", variant: "warning" },
  accepted: { label: "Accepted", variant: "success" },
  expired: { label: "Expired", variant: "destructive" },
};

/** After onboarding: everyone with access — you, people from the folders above, and invitations with their state. */
function PeopleTable({
  projectId,
  firstTime,
  inherited,
  invites,
  onInvite,
}: {
  projectId: string;
  firstTime: boolean;
  inherited: Access[];
  invites: Invite[];
  onInvite: () => void;
}) {
  const people = firstTime ? [] : inherited;
  const count = (firstTime ? 1 : 0) + people.length + invites.length;
  const sources = [...new Set(people.map((p) => p.source))];
  return (
    <section className={CARD} aria-labelledby="team-card-title">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <h2
          id="team-card-title"
          className="text-sm font-semibold text-foreground"
        >
          People with access
        </h2>
        <span className="text-xs text-muted-foreground">
          {count} {count === 1 ? "person" : "people"}
          {sources.length ? (
            <>
              {" "}
              · from{" "}
              {sources.length > 1
                ? `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}`
                : sources[0]}
            </>
          ) : null}
        </span>
        <Button
          size="xs"
          variant="outline"
          className="ml-auto"
          onClick={onInvite}
        >
          <IconUserPlus />
          Invite teammates
        </Button>
      </div>
      <ul>
        {firstTime ? (
          <li className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm">
            <Avatar label="AM" index={0} />
            <span className="min-w-0 flex-1 text-foreground">
              You <span className="text-muted-foreground">· owner</span>
            </span>
            <Badge variant="secondary">Admin</Badge>
          </li>
        ) : null}
        {people.map((p, i) => (
          <li
            key={p.user}
            className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm"
          >
            <Avatar label={initials(p.user)} index={i} />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {p.user}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              from {p.source}
            </span>
            <Badge variant="secondary">{p.role}</Badge>
          </li>
        ))}
        {invites.map((inv, i) => {
          const st = STATUS[inv.status];
          return (
            <li
              key={inv.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-2.5 text-sm last:border-b-0"
            >
              <Avatar
                label={initials(inv.email)}
                index={i + 1}
                dashed={inv.status !== "accepted"}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-foreground">
                  {inv.email}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {inv.status === "accepted"
                    ? "Joined"
                    : inv.status === "expired"
                      ? "Invitation expired"
                      : `Invited ${ago(inv.sentAt)}`}
                </span>
              </span>
              <Badge variant="secondary">{inv.role}</Badge>
              <Badge variant={st.variant}>{st.label}</Badge>
              {inv.status !== "accepted" ? (
                <span className="flex items-center gap-0.5">
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Resend the invitation to ${inv.email}`}
                    title="Resend"
                    className="rounded-full text-muted-foreground"
                    onClick={() => {
                      resendInvite(projectId, inv.id);
                      toast(`Invitation resent to ${inv.email}`);
                    }}
                  >
                    <IconRefresh className="size-3.5" />
                  </Button>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    aria-label={`Revoke the invitation to ${inv.email}`}
                    title="Revoke"
                    className="rounded-full text-muted-foreground"
                    onClick={() => {
                      revokeInvite(projectId, inv.id);
                      toast(`Invitation to ${inv.email} revoked`);
                    }}
                  >
                    <IconX className="size-3.5" />
                  </Button>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ── The invitation modal: several emails, a role each, send together ────────────────────────────────────────────── */
type Row = { key: number; email: string; role: InviteRole };
let rowKey = 0;
const newRow = (email = "", role: InviteRole = "Developer"): Row => ({
  key: ++rowKey,
  email,
  role,
});

function InviteDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  taken,
  brand,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  projectName: string;
  /** Emails already invited to this project. */
  taken: Set<string>;
  brand?: BrandContext;
}) {
  const [rows, setRows] = React.useState<Row[]>(() => [newRow()]);
  const [tried, setTried] = React.useState(false);
  // A fresh form each time it opens (render-time reset, no effect).
  const [seen, setSeen] = React.useState(open);
  if (seen !== open) {
    setSeen(open);
    if (open) {
      setRows([newRow()]);
      setTried(false);
    }
  }

  const errorOf = (r: Row, i: number): string | null => {
    const v = r.email.trim().toLowerCase();
    if (!v) return null;
    if (!EMAIL.test(v)) return "Enter a valid email address";
    if (taken.has(v)) return "Already invited to this project";
    if (rows.findIndex((x) => x.email.trim().toLowerCase() === v) !== i)
      return "Added twice";
    return null;
  };
  const firstEmail = React.useRef<HTMLInputElement>(null);
  const filled = rows.filter((r) => r.email.trim());
  const valid = rows.filter((r, i) => r.email.trim() && !errorOf(r, i));
  const hasErrors = rows.some((r, i) => errorOf(r, i));

  const set = (key: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) =>
    setRows((rs) =>
      rs.length > 1 ? rs.filter((r) => r.key !== key) : [newRow()],
    );
  // Pasting a list ("a@x.com, b@y.com") fills one row per address.
  const onPaste = (key: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const parts = e.clipboardData
      .getData("text")
      .split(/[\s,;]+/)
      .filter(Boolean);
    if (parts.length < 2) return;
    e.preventDefault();
    setRows((rs) => {
      const at = rs.findIndex((r) => r.key === key);
      const role = rs[at]?.role ?? "Developer";
      const added = parts.map((p) => newRow(p, role));
      return [...rs.slice(0, at), ...added, ...rs.slice(at + 1)];
    });
  };
  const send = () => {
    setTried(true);
    if (!valid.length || hasErrors) return;
    sendInvites(
      projectId,
      valid.map((r) => ({ email: r.email.trim(), role: r.role })),
    );
    toast(
      valid.length === 1
        ? `Invitation sent to ${valid[0].email.trim()}`
        : `${valid.length} invitations sent`,
      { description: "They’ll get an email to join " + projectName },
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Two panels (Subframe's sign-up modal as the reference): the form on the left, a product visual on the right.
          Tablet narrows the visual; mobile hides it and the form takes the full width. */}
      <DialogContent
        showCloseButton={false}
        // Open on the first email field, not the close button.
        initialFocus={firstEmail}
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden rounded-[16px] border border-border/70 bg-[#F6F6F6] p-0 shadow-[0_24px_64px_-16px_rgb(12_10_9/0.18),0_2px_6px_rgb(12_10_9/0.04)] ring-0 sm:max-w-[min(1100px,calc(100%-2rem))] md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]"
      >
        {/* The project's Brand DNA is the modal's whole surface: it frames the form card and sits behind the email. */}
        <BrandDNA
          contextType={brand?.contextType ?? "project"}
          contextId={brand?.contextId ?? projectId}
          brandColors={brand?.brandColors}
          brandIcon={brand?.brandIcon}
          className="absolute inset-0"
        />
        {/* Close: the modal's top-right corner, over the visual (as in the onboarding modal); a frosted circle so it
            reads on any brand colour. On mobile the visual is hidden and it sits on the form. */}
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 z-10 size-9 rounded-full text-muted-foreground hover:text-foreground md:bg-white/70 md:shadow-[0_1px_2px_rgb(12_10_9/0.08)] md:backdrop-blur-sm md:hover:bg-white"
            />
          }
        >
          <IconX className="size-5" />
          <span className="sr-only">Close</span>
        </DialogClose>
        {/* Left: the invitation form, framed as a white card inset in the modal's Brand DNA surface (as in the reference). */}
        <div className="relative flex min-h-0 p-[3px]">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[12px] border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgb(12_10_9/0.06),0_8px_24px_-4px_rgb(12_10_9/0.12)] sm:p-10 lg:min-h-[594px] lg:p-12">
            <div className="flex flex-col gap-2 pr-8 md:pr-0">
              <DialogTitle className="font-brand text-[36px] leading-[1.08] font-[450] tracking-[-0.035em] text-[#272727]">
                Invite teammates
              </DialogTitle>
              <DialogDescription className="font-brand text-[15px] text-muted-foreground">
                Bring your team together to set up and launch your webstore.
              </DialogDescription>
            </div>

            <div className="mt-8 flex flex-col gap-2.5">
              <div className="hidden grid-cols-[minmax(0,1fr)_168px_36px] gap-2 px-0.5 text-xs font-medium text-muted-foreground sm:grid">
                <span>Email</span>
                <span>Role</span>
                <span />
              </div>
              {rows.map((r, i) => {
                const err = errorOf(r, i);
                const show =
                  err &&
                  (tried ||
                    !EMAIL.test(r.email.trim()) === false ||
                    err !== "Enter a valid email address");
                return (
                  <div key={r.key} className="flex flex-col gap-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_36px] gap-2 sm:grid-cols-[minmax(0,1fr)_168px_36px]">
                      <Input
                        type="email"
                        value={r.email}
                        onChange={(e) => set(r.key, { email: e.target.value })}
                        onPaste={(e) => onPaste(r.key, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setRows((rs) => [...rs, newRow("", r.role)]);
                          }
                        }}
                        placeholder="name@company.com"
                        ref={i === 0 ? firstEmail : undefined}
                        aria-label={`Email ${i + 1}`}
                        aria-invalid={!!show}
                        autoFocus={i === rows.length - 1 && rows.length > 1}
                        className="h-10"
                      />
                      <Select
                        items={Object.fromEntries(
                          INVITE_ROLES.map((x) => [x.id, x.id]),
                        )}
                        value={r.role}
                        onValueChange={(v) =>
                          v && set(r.key, { role: v as InviteRole })
                        }
                      >
                        <SelectTrigger
                          aria-label={`Role for email ${i + 1}`}
                          className="order-3 col-span-2 h-10! w-full sm:order-none sm:col-span-1"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent
                          alignItemWithTrigger={false}
                          className="w-80 p-1"
                        >
                          {INVITE_ROLES.map((x) => (
                            <SelectItem
                              key={x.id}
                              value={x.id}
                              // The text may shrink and wrap, so a long description never runs under the check;
                              // the description stays grey when the row is highlighted.
                              className="py-2 *:first:min-w-0 *:first:shrink *:first:whitespace-normal"
                            >
                              <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="text-sm text-foreground">
                                  {x.id}
                                </span>
                                <span className="text-xs leading-4 text-muted-foreground!">
                                  {x.description}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove email ${i + 1}`}
                        className="size-10 rounded-full text-muted-foreground"
                        onClick={() => remove(r.key)}
                        disabled={rows.length === 1 && !r.email}
                      >
                        <IconX className="size-4" />
                      </Button>
                    </div>
                    {show ? (
                      <span className="px-0.5 text-xs text-destructive">
                        {err}
                      </span>
                    ) : null}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() =>
                  setRows((rs) => [
                    ...rs,
                    newRow("", rs.at(-1)?.role ?? "Developer"),
                  ])
                }
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <IconPlus className="size-4" />
                Add another
              </button>
              <p className="px-0.5 text-xs text-muted-foreground">
                You can invite multiple teammates at once.
              </p>
            </div>

            <div className="mt-auto flex flex-col-reverse gap-2 pt-10 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="h-10 px-4"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-10 px-4"
                onClick={send}
                disabled={!filled.length || (tried && hasErrors)}
              >
                {valid.length > 1
                  ? `Send ${valid.length} invitations`
                  : "Send invitation"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: a preview of the invitation email teammates will get, on the Brand DNA (decorative). */}
        <div aria-hidden className="relative hidden min-h-0 md:block">
          <InviteEmailPreview
            projectName={projectName}
            projectIcon={brand?.brandIcon}
            to={valid[0]?.email.trim()}
            role={(valid[0] ?? rows[0]).role}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── The modal's visual: the invitation email a teammate will get ──────────────────────────────────────────────── */
/** A mock of the invitation email, running off the panel's edge. It follows the form: the first teammate's address
 *  and role, the project's name and icon, and the signed-in user as the sender. */
function InviteEmailPreview({
  projectName,
  projectIcon,
  to,
  role,
}: {
  projectName: string;
  projectIcon?: string;
  to?: string;
  role: InviteRole;
}) {
  const sender = participantName() ?? "Alex Morgan";
  return (
    <div className="absolute top-16 left-10 w-[600px] overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-[0_18px_48px_-12px_rgb(12_10_9/0.22)] lg:left-12">
      {/* The card runs off the panel's edge; its content stays in the part you can see. */}
      <div className="border-b border-border/80 bg-[#FAFAF9] px-5 py-3.5">
        <div className="flex max-w-[210px] flex-col gap-1 text-xs lg:max-w-[420px]">
          <p className="flex gap-2 truncate">
            <span className="w-9 shrink-0 text-muted-foreground">From</span>
            <span className="truncate font-medium text-foreground">
              Appcharge
            </span>
          </p>
          <p className="flex gap-2 truncate">
            <span className="w-9 shrink-0 text-muted-foreground">To</span>
            <span
              className={cn(
                "truncate",
                to ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {to || "name@company.com"}
            </span>
          </p>
          <p className="mt-1 truncate text-[13px] font-semibold text-foreground">
            {sender} invited you to {projectName}
          </p>
        </div>
      </div>
      <div className="px-8 pt-8 pb-9">
        <div className="flex max-w-[210px] flex-col items-start lg:max-w-[400px]">
          <div className="flex items-center gap-2.5">
            {projectIcon ? (
              // eslint-disable-next-line @next/next/no-img-element -- the game's store icon
              <img
                src={projectIcon}
                alt=""
                className="size-11 shrink-0 rounded-xl object-cover shadow-[0_1px_2px_rgb(12_10_9/0.12)]"
              />
            ) : (
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground">
                {initials(projectName)}
              </span>
            )}
            <AppchargeLogo className="size-6 shrink-0" />
          </div>
          <p className="mt-5 text-lg leading-snug font-semibold tracking-[-0.01em] text-foreground">
            Join {projectName}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
            {sender} invited you to help set up and launch the webstore, as{" "}
            {role === "Admin" ? "an" : "a"}{" "}
            <span className="font-medium text-foreground">{role}</span>.
          </p>
          <span className="mt-6 inline-flex h-9 items-center rounded-full bg-primary px-4 text-[13px] font-medium text-primary-foreground">
            Accept invitation
          </span>
          <p className="mt-5 text-[11px] text-muted-foreground">
            This invitation expires in 7 days.
          </p>
        </div>
      </div>
    </div>
  );
}
