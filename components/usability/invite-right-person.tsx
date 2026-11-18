"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { IconChevronLeft, IconCircleCheckFilled, IconInbox, IconShieldCheck, IconUserCog, IconEye } from "@/lib/icons";
import { AppchargeLogo } from "@/components/dashboard/logo";
import { participantName } from "@/lib/usability-session";
import { cn } from "@/lib/utils";

const ROLES = [
  { id: "admin", label: "Admin", Icon: IconShieldCheck, text: "Can set up folders, projects and modules, and invite others.", note: "Needed to finish the setup" },
  { id: "editor", label: "Editor", Icon: IconUserCog, text: "Can work in projects, but not change the structure or access." },
  { id: "viewer", label: "Viewer", Icon: IconEye, text: "Can look around, but not change anything." },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Same brand system as the rest of onboarding (Appcharge website): the panel tone, the charcoal pill. */
const PANEL = "#272727";
const ACCENT = "#338DE8";
const TINT = "#EAF3FD";
/** The dark buttons: a soft top-to-bottom gradient. */
const CHARCOAL = "linear-gradient(180deg, #272727 0%, #302F2F 100%)";

/**
 * "I'm not the right person" (onboarding exit), as a step of the onboarding flow in the same split layout: the invite
 * on the left (work email, role, an optional note), and on the right a live preview of the invitation email they'll
 * get. Admin is the default, since the setup needs it (Permissions PRD). Sending shows "Invite sent"; Done hands back to
 * the caller, which closes onboarding. In the prototype nothing is actually sent.
 */
export function InviteRightPerson({
  open,
  onOpenChange,
  company,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: string;
  /** Called with the invited email after "Done": close onboarding and land the participant on the dashboard. */
  onDone: (email: string) => void;
}) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("admin");
  const [note, setNote] = React.useState("");
  const [touched, setTouched] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);
  const error = !email.trim() ? "Enter their work email" : !EMAIL.test(email.trim()) ? "Enter a valid email, like name@company.com" : null;
  const roleLabel = ROLES.find((r) => r.id === role)?.label ?? "Admin";
  const sender = participantName() ?? "A teammate";

  const reset = () => {
    setEmail("");
    setRole("admin");
    setNote("");
    setTouched(false);
    setSent(false);
  };
  const cancel = () => {
    onOpenChange(false);
    reset();
  };
  const send = () => {
    setTouched(true);
    if (error) {
      emailRef.current?.focus();
      return;
    }
    setSent(true);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => (v ? onOpenChange(true) : cancel())}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Popup
          className={cn(
            "font-brand fixed inset-0 z-[60] grid overflow-y-auto bg-background outline-none duration-300 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        >
          <section className="flex min-h-svh flex-col px-6 pt-5 pb-8 sm:px-12 lg:px-16">
            <div className="flex h-10 items-center">
              {!sent ? (
                <button
                  type="button"
                  onClick={cancel}
                  aria-label="Back"
                  className="-ml-2 flex size-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted"
                >
                  <IconChevronLeft className="size-5" />
                </button>
              ) : (
                <AppchargeLogo className="size-7" />
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center py-10">
              <div key={sent ? "sent" : "form"} className="w-full max-w-[34rem] animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
                {sent ? (
                  <>
                    <IconCircleCheckFilled className="size-10 text-[#16a34a]" />
                    <DialogPrimitive.Title className="mt-4 text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">Invite sent</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                      We&apos;ve emailed <span className="font-medium text-foreground">{email.trim()}</span>. They&apos;ll join {company} as {roleLabel} and can pick
                      up the setup from here. You can keep looking around in the meantime.
                    </DialogPrimitive.Description>
                  </>
                ) : (
                  <form
                    id="invite-form"
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      send();
                    }}
                  >
                    <div className="mb-8">
                      <DialogPrimitive.Title className="text-[36px] font-[450] leading-[1.08] tracking-[-0.035em] text-[#272727]">Invite the right person</DialogPrimitive.Title>
                      <DialogPrimitive.Description className="mt-2 text-[15px] text-muted-foreground">
                        Who should set up {company} on Appcharge? We&apos;ll email them an invite to join and finish the setup.
                      </DialogPrimitive.Description>
                    </div>

                    <label htmlFor="invite-email" className="block text-sm font-medium">
                      Work email
                    </label>
                    <input
                      ref={emailRef}
                      id="invite-email"
                      type="email"
                      autoFocus
                      autoComplete="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => email && setTouched(true)}
                      placeholder="name@company.com"
                      aria-invalid={touched && !!error}
                      className={cn(
                        "mt-2 h-12 w-full rounded-lg border bg-background px-3.5 text-[15px] outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/20",
                        touched && error ? "border-destructive" : "border-input focus-visible:border-foreground/40",
                      )}
                    />
                    {touched && error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}

                    <p className="mt-6 text-sm font-medium">Role</p>
                    <div role="radiogroup" aria-label="Role" className="mt-2 flex flex-col gap-2">
                      {ROLES.map(({ id, label, Icon, text, note: hint }) => {
                        const on = role === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setRole(id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/30",
                              !on && "border-border hover:border-foreground/25",
                            )}
                            style={on ? { borderColor: ACCENT, background: TINT } : undefined}
                          >
                            <Icon className="mt-0.5 size-5 shrink-0" stroke={1.6} style={{ color: on ? ACCENT : undefined }} />
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="text-[15px] font-medium text-foreground">
                                {label}
                                {hint ? <span className="ml-2 text-xs font-normal text-muted-foreground">{hint}</span> : null}
                              </span>
                              <span className="text-sm text-muted-foreground">{text}</span>
                            </span>
                            <span
                              aria-hidden
                              className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors", !on && "border-input")}
                              style={on ? { borderColor: ACCENT } : undefined}
                            >
                              {on ? <span className="size-2.5 rounded-full" style={{ background: ACCENT }} /> : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <label htmlFor="invite-note" className="mt-6 block text-sm font-medium">
                      Note <span className="font-normal text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      id="invite-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Can you set up our studios and the first store?"
                      className="mt-2 min-h-20 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-foreground/40 focus-visible:ring-[3px] focus-visible:ring-ring/20"
                    />
                  </form>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex-1" />
              {sent ? (
                <button
                  type="button"
                  onClick={() => {
                    const to = email.trim();
                    onOpenChange(false);
                    reset();
                    onDone(to);
                  }}
                  className="h-11 rounded-[200px] shadow-md px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-85"
                  style={{ background: CHARCOAL }}
                >
                  Done
                </button>
              ) : (
                <>
                  <button type="button" onClick={cancel} className="h-11 rounded-full px-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground">
                    Cancel
                  </button>
                  <button type="submit" form="invite-form" className="h-11 rounded-[200px] shadow-md px-7 text-[15px] font-medium text-white transition-opacity hover:opacity-85" style={{ background: CHARCOAL }}>
                    Send invite
                  </button>
                </>
              )}
            </div>
          </section>

          {/* The visual: the invitation email as they'll get it, filled in as you type. */}
          <aside className="hidden items-center justify-center p-10 lg:sticky lg:top-0 lg:flex lg:h-svh xl:p-16" style={{ background: PANEL }}>
            <InvitePreview email={email.trim()} roleLabel={roleLabel} note={note.trim()} sender={sender} company={company} sent={sent} />
          </aside>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** The invitation email in a mail window: who it's from and to, the role, your note, and Accept invite. */
function InvitePreview({ email, roleLabel, note, sender, company, sent }: { email: string; roleLabel: string; note: string; sender: string; company: string; sent: boolean }) {
  return (
    <div aria-hidden className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-black/5 bg-background shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm font-medium">
          <IconInbox className="size-4 text-muted-foreground" />
          Inbox
        </span>
        <span className="flex-1" />
        {sent ? (
          <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-[#16a34a]">
            <IconCircleCheckFilled className="size-3.5" />
            Sent
          </span>
        ) : null}
      </div>
      <div className="border-b border-border px-6 py-4 text-sm">
        <p className="text-[15px] font-semibold">
          {sender} invited you to set up {company} on Appcharge
        </p>
        <p className="mt-2 text-muted-foreground">
          <span className="text-foreground">Appcharge</span> &lt;no-reply@appcharge.com&gt;
        </p>
        <p className="text-muted-foreground">
          To: {email ? <span className="text-foreground">{email}</span> : <span className="rounded bg-muted px-1.5">name@company.com</span>}
        </p>
      </div>
      <div className="bg-muted/40 px-6 py-6">
        <div className="mx-auto max-w-md rounded-xl border border-border bg-background px-7 py-7">
          <div className="flex items-center gap-2">
            <AppchargeLogo className="size-6" />
            <span className="text-[14px] font-semibold tracking-tight">appcharge</span>
          </div>
          <p className="mt-5 text-[20px] font-[450] leading-tight tracking-[-0.02em] text-[#272727]">Join {company} on Appcharge</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {sender} invited you as <span className="font-medium text-foreground">{roleLabel}</span> to set up {company}&apos;s folders and first store.
          </p>
          {note ? (
            <blockquote className="mt-4 border-l-2 pl-3 text-sm text-foreground" style={{ borderColor: ACCENT }}>
              {note}
            </blockquote>
          ) : null}
          <span className="mt-6 inline-flex h-10 items-center rounded-[200px] shadow-md px-6 text-sm font-medium text-white" style={{ background: CHARCOAL }}>
            Accept invite
          </span>
          <p className="mt-6 text-xs text-muted-foreground">This invite expires in 7 days.</p>
        </div>
      </div>
    </div>
  );
}
