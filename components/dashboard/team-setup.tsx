"use client";

import * as React from "react";
import { toast } from "sonner";
import { IconPlus, IconRefresh, IconUserPlus, IconUsers, IconX } from "@/lib/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Access } from "@/lib/folders";
import { cn } from "@/lib/utils";

/*
 * First-time team setup (project Overview): a project with no teammates shows "Set up your team"; inviting opens a
 * modal for several emails, each with a role; once anyone is invited, the card becomes People with access, where each
 * invitation is Pending, Accepted or Expired. Invitations live in this session (a prototype store, below); a real
 * invitations API plugs in at `sendInvites` / `resendInvite` / `revokeInvite`.
 */

export type InviteRole = "Admin" | "Developer" | "Finance" | "Viewer";
export const INVITE_ROLES: { id: InviteRole; description: string }[] = [
  { id: "Admin", description: "Full project access" },
  { id: "Developer", description: "Technical configuration, APIs and integrations" },
  { id: "Finance", description: "Financial settings and payments" },
  { id: "Viewer", description: "Read-only access" },
];
export type InviteStatus = "pending" | "accepted" | "expired";
export type Invite = { id: string; email: string; role: InviteRole; status: InviteStatus; sentAt: number };

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
const effective = (i: Invite): Invite => (i.status === "pending" && Date.now() - i.sentAt > INVITE_TTL ? { ...i, status: "expired" } : i);

export function useInvites(projectId: string) {
  const list = React.useSyncExternalStore(
    subscribe,
    () => store.get(projectId) ?? EMPTY,
    () => EMPTY,
  );
  return list.map(effective);
}

export function sendInvites(projectId: string, rows: { email: string; role: InviteRole }[]) {
  const now = Date.now();
  const sent = rows.map((r, i) => ({ id: `${now}-${i}`, email: r.email, role: r.role, status: "pending" as const, sentAt: now }));
  update(projectId, (list) => [...list, ...sent]);
  // Prototype: the first person accepts a few seconds later, so the Accepted state can be seen.
  const first = sent[0];
  if (first)
    window.setTimeout(() => {
      update(projectId, (list) => list.map((i) => (i.id === first.id && i.status === "pending" ? { ...i, status: "accepted" } : i)));
      toast(`${first.email} joined the project`, { description: `As ${first.role}` });
    }, 6000);
}
export const resendInvite = (projectId: string, id: string) =>
  update(projectId, (list) => list.map((i) => (i.id === id ? { ...i, status: "pending", sentAt: Date.now() } : i)));
export const revokeInvite = (projectId: string, id: string) => update(projectId, (list) => list.filter((i) => i.id !== id));

/* ── Helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AVATAR_COLORS = ["#4F46E5", "#0D9488", "#DB2777", "#EA580C", "#2563EB", "#7C3AED"];
const initials = (nameOrEmail: string) => {
  const base = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0].replace(/[._-]+/g, " ") : nameOrEmail;
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
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};
function Avatar({ label, index, dashed }: { label: string; index: number; dashed?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white",
        dashed && "border border-dashed border-foreground/25 bg-background text-muted-foreground",
      )}
      style={dashed ? undefined : { background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {label}
    </span>
  );
}

const CARD = "overflow-hidden rounded-2xl border border-border bg-card shadow-card";

/* ── The card: Team Setup (first time) or People with access ──────────────────────────────────────────────────────── */
export function TeamSection({
  projectId,
  projectName,
  firstTime,
  inherited,
}: {
  projectId: string;
  projectName: string;
  /** A new project with nobody on it yet: show "Set up your team" until someone is invited. */
  firstTime: boolean;
  /** People who already have access through the folders above (not on a first-time project). */
  inherited: Access[];
}) {
  const invites = useInvites(projectId);
  const [open, setOpen] = React.useState(false);
  const taken = React.useMemo(() => new Set(invites.map((i) => i.email.toLowerCase())), [invites]);
  const dialog = <InviteDialog open={open} onOpenChange={setOpen} projectId={projectId} projectName={projectName} taken={taken} />;

  if (firstTime && invites.length === 0)
    return (
      <>
        <TeamSetupEmpty onInvite={() => setOpen(true)} />
        {dialog}
      </>
    );
  return (
    <>
      <PeopleTable projectId={projectId} firstTime={firstTime} inherited={inherited} invites={invites} onInvite={() => setOpen(true)} />
      {dialog}
    </>
  );
}

/** First time: what the team is for, one button, and a quiet "nobody yet". */
function TeamSetupEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <section className={cn(CARD, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center")} aria-labelledby="team-setup-title">
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <IconUsers className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 id="team-setup-title" className="text-sm font-semibold text-foreground">
          Set up your team
        </h2>
        <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
          Invite your teammates to help configure and launch your Webstore. Give each person the right level of access.
        </p>
        {/* Nobody invited yet: three empty seats. */}
        <div className="mt-3 flex items-center gap-2">
          <span className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} aria-hidden className="size-6 rounded-full border border-dashed border-foreground/25 bg-background" />
            ))}
          </span>
          <span className="text-xs text-muted-foreground">No teammates invited yet</span>
        </div>
      </div>
      <Button size="sm" className="h-8 shrink-0 self-start px-3 text-nav sm:self-center" onClick={onInvite}>
        <IconUserPlus />
        Invite teammates
      </Button>
    </section>
  );
}

const STATUS: Record<InviteStatus, { label: string; variant: "warning" | "success" | "destructive" }> = {
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
        <h2 id="team-card-title" className="text-sm font-semibold text-foreground">
          People with access
        </h2>
        <span className="text-xs text-muted-foreground">
          {count} {count === 1 ? "person" : "people"}
          {sources.length ? <> · from {sources.length > 1 ? `${sources.slice(0, -1).join(", ")} and ${sources.at(-1)}` : sources[0]}</> : null}
        </span>
        <Button size="xs" variant="outline" className="ml-auto" onClick={onInvite}>
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
          <li key={p.user} className="flex items-center gap-3 border-b border-border px-5 py-2.5 text-sm">
            <Avatar label={initials(p.user)} index={i} />
            <span className="min-w-0 flex-1 truncate text-foreground">{p.user}</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">from {p.source}</span>
            <Badge variant="secondary">{p.role}</Badge>
          </li>
        ))}
        {invites.map((inv, i) => {
          const st = STATUS[inv.status];
          return (
            <li key={inv.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border px-5 py-2.5 text-sm last:border-b-0">
              <Avatar label={initials(inv.email)} index={i + 1} dashed={inv.status !== "accepted"} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-foreground">{inv.email}</span>
                <span className="block text-xs text-muted-foreground">
                  {inv.status === "accepted" ? "Joined" : inv.status === "expired" ? "Invitation expired" : `Invited ${ago(inv.sentAt)}`}
                </span>
              </span>
              <Badge variant="secondary">{inv.role}</Badge>
              <Badge variant={st.variant}>{st.label}</Badge>
              {inv.status !== "accepted" ? (
                <span className="flex items-center gap-0.5">
                  <Button size="icon-xs" variant="ghost" aria-label={`Resend the invitation to ${inv.email}`} title="Resend" className="rounded-full text-muted-foreground" onClick={() => { resendInvite(projectId, inv.id); toast(`Invitation resent to ${inv.email}`); }}>
                    <IconRefresh className="size-3.5" />
                  </Button>
                  <Button size="icon-xs" variant="ghost" aria-label={`Revoke the invitation to ${inv.email}`} title="Revoke" className="rounded-full text-muted-foreground" onClick={() => { revokeInvite(projectId, inv.id); toast(`Invitation to ${inv.email} revoked`); }}>
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
const newRow = (email = "", role: InviteRole = "Developer"): Row => ({ key: ++rowKey, email, role });

function InviteDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  taken,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  projectName: string;
  /** Emails already invited to this project. */
  taken: Set<string>;
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
    if (rows.findIndex((x) => x.email.trim().toLowerCase() === v) !== i) return "Added twice";
    return null;
  };
  const filled = rows.filter((r) => r.email.trim());
  const valid = rows.filter((r, i) => r.email.trim() && !errorOf(r, i));
  const hasErrors = rows.some((r, i) => errorOf(r, i));

  const set = (key: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const remove = (key: number) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.key !== key) : [newRow()]));
  // Pasting a list ("a@x.com, b@y.com") fills one row per address.
  const onPaste = (key: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const parts = e.clipboardData.getData("text").split(/[\s,;]+/).filter(Boolean);
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
    sendInvites(projectId, valid.map((r) => ({ email: r.email.trim(), role: r.role })));
    toast(valid.length === 1 ? `Invitation sent to ${valid[0].email.trim()}` : `${valid.length} invitations sent`, { description: "They’ll get an email to join " + projectName });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
          <DialogDescription>
            They’ll get an email to join {projectName}. Pick what each person can do; invitations expire after 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <div className="hidden grid-cols-[minmax(0,1fr)_168px_28px] gap-2 px-0.5 text-xs font-medium text-muted-foreground sm:grid">
            <span>Email</span>
            <span>Role</span>
            <span />
          </div>
          {rows.map((r, i) => {
            const err = errorOf(r, i);
            const show = err && (tried || !EMAIL.test(r.email.trim()) === false || err !== "Enter a valid email address");
            return (
              <div key={r.key} className="flex flex-col gap-1">
                <div className="grid grid-cols-[minmax(0,1fr)_28px] gap-2 sm:grid-cols-[minmax(0,1fr)_168px_28px]">
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
                    aria-label={`Email ${i + 1}`}
                    aria-invalid={!!show}
                    autoFocus={i === rows.length - 1 && rows.length > 1}
                    className="h-9"
                  />
                  <Select items={Object.fromEntries(INVITE_ROLES.map((x) => [x.id, x.id]))} value={r.role} onValueChange={(v) => v && set(r.key, { role: v as InviteRole })}>
                    <SelectTrigger size="sm" aria-label={`Role for email ${i + 1}`} className="order-3 col-span-2 h-9 w-full sm:order-none sm:col-span-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false} className="w-72 p-1">
                      {INVITE_ROLES.map((x) => (
                        <SelectItem key={x.id} value={x.id} className="py-1.5">
                          <span className="flex flex-col">
                            <span className="text-sm text-foreground">{x.id}</span>
                            <span className="text-xs text-muted-foreground">{x.description}</span>
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
                    className="size-9 rounded-full text-muted-foreground"
                    onClick={() => remove(r.key)}
                    disabled={rows.length === 1 && !r.email}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
                {show ? <span className="px-0.5 text-xs text-destructive">{err}</span> : null}
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, newRow("", rs.at(-1)?.role ?? "Developer")])}
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-sm font-medium text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <IconPlus className="size-4" />
            Add another
          </button>
          <p className="text-xs text-muted-foreground">Tip: paste a list of emails to add them all at once.</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={send} disabled={!filled.length || (tried && hasErrors)}>
            {valid.length > 1 ? `Send ${valid.length} invitations` : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
