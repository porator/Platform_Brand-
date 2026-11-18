"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  IconUser,
  IconLock,
  IconLanguage,
  IconBook2,
  IconLifebuoy,
  IconHelpCircle,
  IconLogout,
  IconEye,
  IconEyeOff,
} from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { teamAvatar } from "@/lib/team";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { participantName } from "@/lib/usability-session";

/* ------------------------------- data ---------------------------------- */

/** Usability test: the signed-in user is the participant, by the name they gave on the intro (a King Admin). */
const USER = {
  get name() {
    return participantName() ?? "Alex Morgan";
  },
  get email() {
    const first = this.name.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "admin";
    return `${first}@acmegames.com`;
  },
  title: "Admin",
  role: "Admin",
  get initials() {
    return (this.name.match(/\S+/g) ?? ["?"]).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  },
};

/** The signed-in user's avatar: their team picture (or initials on their colour) when the name typed on the intro is
 *  someone on the Appcharge team, else their initials. */
function UserAvatar() {
  const team = teamAvatar(USER.name);
  return (
    <Avatar size="sm">
      {team?.src ? <AvatarImage src={team.src} alt="" /> : null}
      {team?.color ? (
        <AvatarFallback className="text-[10px] font-medium text-white" style={{ background: team.color }}>
          {team.person ? <IconUser className="size-3.5" stroke={2.5} /> : team.initials}
        </AvatarFallback>
      ) : (
        <AvatarFallback>{USER.initials}</AvatarFallback>
      )}
    </Avatar>
  );
}

const LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ru", label: "Russian", flag: "🇷🇺" },
  { id: "ko", label: "Korean", flag: "🇰🇷" },
  { id: "ja", label: "Japanese", flag: "🇯🇵" },
  { id: "zh", label: "Chinese", flag: "🇨🇳" },
  { id: "fr", label: "French", flag: "🇫🇷" },
  { id: "es", label: "Spanish", flag: "🇪🇸" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* --------------------------- password field ---------------------------- */

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
          className="pr-9"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        >
          {show ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
        </button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/* ------------------------------ edit profile --------------------------- */

function EditProfileDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [base, setBase] = React.useState({ name: USER.name, email: USER.email, title: USER.title });
  const [form, setForm] = React.useState(base);
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [confirmDiscard, setConfirmDiscard] = React.useState(false);

  const dirty = form.name !== base.name || form.email !== base.email || form.title !== base.title;

  const requestClose = (next: boolean) => {
    if (next) {
      setForm(base);
      setErrors({});
      onOpenChange(true);
    } else if (dirty) {
      setConfirmDiscard(true);
    } else {
      onOpenChange(false);
    }
  };

  const save = () => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Full name is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(form.email)) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBase(form);
    onOpenChange(false);
    toast.success("Profile updated", { description: "Your account details were saved." });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={requestClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>Update your personal account information.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-1">
            <div className="grid gap-1.5">
              <Label htmlFor="pf-name">Full name</Label>
              <Input
                id="pf-name"
                value={form.name}
                aria-invalid={!!errors.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pf-email">Email</Label>
              <Input
                id="pf-email"
                type="email"
                value={form.email}
                aria-invalid={!!errors.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pf-title">Job title</Label>
              <Input
                id="pf-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-muted-foreground">Role</Label>
              <div className="flex h-9 items-center">
                <Badge variant="secondary">{USER.role}</Badge>
                <span className="ml-2 text-xs text-muted-foreground">Managed by your workspace admin</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => requestClose(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!dirty}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes to your profile. They&apos;ll be lost if you close now.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setForm(base);
                setErrors({});
                setConfirmDiscard(false);
                onOpenChange(false);
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/* ---------------------------- change password -------------------------- */

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setLoading(false);
  };

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = current.length > 0 && next.length >= 8 && confirm === next;

  const submit = () => {
    if (!valid || loading) return;
    setLoading(true);
    // Prototype: no backend. Simulate a secure submit; never persist the value.
    window.setTimeout(() => {
      reset();
      onOpenChange(false);
      toast.success("Password changed", { description: "Use your new password next time you sign in." });
    }, 800);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Use at least 8 characters. You&apos;ll stay signed in on this device.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <PasswordField id="cp-current" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
          <PasswordField
            id="cp-new"
            label="New password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            error={tooShort ? "Must be at least 8 characters." : undefined}
          />
          <PasswordField
            id="cp-confirm"
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            error={mismatch ? "Passwords don't match." : undefined}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid || loading}>
            {loading ? "Changing…" : "Change password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------ account menu --------------------------- */

/**
 * Profile dropdown + account settings. A compact, grouped menu (Account /
 * Support / Session) with an identity header. Dashboard Language is an inline
 * submenu; Edit Profile and Change Password open focused dialogs.
 */
export function AccountMenu({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const router = useRouter();
  const [lang, setLang] = React.useState<string>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return localStorage.getItem("ac-lang") || "en";
    } catch {
      return "en";
    }
  });
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [pwOpen, setPwOpen] = React.useState(false);

  const current = LANGUAGES.find((l) => l.id === lang) ?? LANGUAGES[0];

  const pickLang = (id: string) => {
    setLang(id);
    try {
      localStorage.setItem("ac-lang", id);
    } catch {
      /* ignore */
    }
    const l = LANGUAGES.find((x) => x.id === id);
    toast.success(`Language set to ${l?.label}`, {
      description: "Saved to your profile — the interface stays in English for now.",
    });
  };

  // Support links have no destinations in this prototype — surface that rather
  // than inventing URLs.
  const openResource = (what: string) =>
    toast(`${what} isn't connected yet`, { description: "Add its URL in configuration to enable this link." });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            variant === "full" ? (
              <button
                type="button"
                aria-label="Account menu"
                className="group/acct flex w-full items-center gap-2 rounded-md p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent/50 focus-visible:ring-2 focus-visible:ring-ring/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1"
              />
            ) : (
              <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full" />
            )
          }
        >
          <UserAvatar />
          {variant === "full" ? (
            <span className="min-w-0 flex-1 truncate text-left text-sm font-medium text-sidebar-foreground/70 group-hover/acct:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
              {USER.name}
            </span>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={variant === "full" ? "start" : "end"} side={variant === "full" ? "top" : "bottom"} className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="py-2">
              <div className="flex items-center gap-2.5">
                <UserAvatar />
                <div className="grid min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-foreground">{USER.name}</span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {USER.role}
                    </Badge>
                  </div>
                  <span className="truncate text-xs font-normal text-muted-foreground">{USER.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <IconUser />
              Edit profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPwOpen(true)}>
              <IconLock />
              Change password
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <IconLanguage />
                <span className="whitespace-nowrap">Dashboard language</span>
                <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span aria-hidden>{current.flag}</span>
                  {current.label}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                <DropdownMenuRadioGroup value={lang} onValueChange={pickLang}>
                  {LANGUAGES.map((l) => (
                    <DropdownMenuRadioItem key={l.id} value={l.id} className="gap-2">
                      <span aria-hidden>{l.flag}</span>
                      {l.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Support &amp; resources</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => openResource("Documentation")}>
              <IconBook2 />
              Documentation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openResource("Contact support")}>
              <IconLifebuoy />
              Contact support
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openResource("Help center")}>
              <IconHelpCircle />
              Help center
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Log out: back to the sign-in page (signing in again goes through organization onboarding). */}
          <DropdownMenuItem variant="destructive" onClick={() => router.push("/login")}>
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />
    </>
  );
}
