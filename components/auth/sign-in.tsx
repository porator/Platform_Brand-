"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { GradientScene } from "@/components/gradient-tool/gradient-scene";
import { markSignInHandoff } from "@/components/auth/sign-in-transition";
import { AppchargeLogo } from "@/components/dashboard/logo";
import { IconEye, IconEyeOff, IconLoader2 } from "@/lib/icons";
import { cn } from "@/lib/utils";

/*
 * Sign in (/login) and Sign up (/signup): one layout (the Lovable-style split): the form on a white page and the
 * Gradient Tool's animated scene in a rounded panel. Both continue to organization onboarding (app/onboarding), then
 * into the company. For demos, the fields type themselves in; clicking into a field stops it so you can type.
 */

type Mode = "signin" | "signup";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** What the fields type in by themselves (a demo account). */
const DEMO = { name: "Alex Morgan", email: "alex@acmegames.com", password: "appcharge-demo" };
/** A taller field with room for its label inside, text set low under it. */
const FIELD = "peer h-11 bg-white px-3 pt-[18px] pb-1 text-sm";
/** The label inside the field: centred like a placeholder while empty, small at the top once focused or filled. */
const FLOAT_LABEL =
  "pointer-events-none absolute top-1/2 left-3 origin-left -translate-y-1/2 text-sm font-normal text-muted-foreground transition-all duration-150 peer-focus:top-[11px] peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-[11px] peer-[:not(:placeholder-shown)]:text-[11px]";

const COPY: Record<Mode, { title: string; welcome: string; submit: string }> = {
  signin: { title: "Sign in", welcome: "Welcome back to Appcharge.", submit: "Sign in" },
  signup: { title: "Sign up", welcome: "Create your Appcharge account.", submit: "Create account" },
};

export function SignIn() {
  return <AuthPage mode="signin" />;
}
export function SignUp() {
  return <AuthPage mode="signup" />;
}

/** Types each value into its field, one after another; stops for good once `stopped` is set. */
function useAutoType(plan: [(v: string) => void, string][], stopped: React.RefObject<boolean>) {
  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let timer = 0;
    let field = 0;
    let n = 0;
    const tick = () => {
      if (stopped.current || field >= plan.length) return;
      const [set, value] = plan[field];
      if (reduce) {
        plan.forEach(([s, v]) => s(v));
        return;
      }
      n += 1;
      set(value.slice(0, n));
      if (n >= value.length) {
        field += 1;
        n = 0;
        timer = window.setTimeout(tick, 260);
      } else timer = window.setTimeout(tick, 38);
    };
    timer = window.setTimeout(tick, 550);
    return () => clearTimeout(timer);
    // The plan is fixed for the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

function AuthPage({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const signup = mode === "signup";
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [leaving, setLeaving] = React.useState(false);

  // Demo: the fields fill themselves in; any click or key in a field hands them back to you.
  const stopped = React.useRef(false);
  const takeOver = () => {
    stopped.current = true;
  };
  useAutoType(
    signup
      ? [
          [setName, DEMO.name],
          [setEmail, DEMO.email],
          [setPassword, DEMO.password],
        ]
      : [
          [setEmail, DEMO.email],
          [setPassword, DEMO.password],
        ],
    stopped,
  );

  const nameError = signup && name.trim().length < 2 ? "Enter your full name" : null;
  const emailError = !email.trim() ? "Enter your work email" : !EMAIL.test(email.trim()) ? "Enter a valid email address" : null;
  const passwordError = !password ? (signup ? "Choose a password" : "Enter your password") : signup && password.length < 8 ? "Use at least 8 characters" : null;

  React.useEffect(() => {
    router.prefetch("/onboarding");
    router.prefetch(signup ? "/login" : "/signup");
  }, [router, signup]);

  /**
   * Into onboarding: the form fades out while the animated panel stays; onboarding opens with the same scene in its
   * panel (same place, same moment), which cross-fades into its preview as the new form fades in.
   */
  const go = () => {
    setBusy(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      setLeaving(true);
      setTimeout(
        () => {
          if (!reduce) markSignInHandoff();
          router.push("/onboarding");
        },
        reduce ? 0 : 380,
      );
    }, 150);
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    stopped.current = true;
    setTried(true);
    if (nameError || emailError || passwordError) return;
    go();
  };

  const id = (f: string) => `${mode}-${f}`;

  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] bg-white lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1">
      {/* The form: on the left on wide screens (as in onboarding), under the band on smaller ones. */}
      <main
        className={cn(
          "flex items-center justify-center px-6 py-10 transition-[opacity,translate] duration-[380ms] ease-out motion-reduce:transition-none sm:px-12 lg:py-12",
          leaving && "pointer-events-none -translate-y-1.5 opacity-0",
        )}
      >
        <div key={mode} className="w-full max-w-[360px] animate-in duration-300 fade-in-0">
          <AppchargeLogo className="mx-auto block size-9" />
          {/* No visible title; the page still has one for screen readers. */}
          <h1 className="sr-only">{copy.title}</h1>
          <p className="mt-6 text-center font-brand text-[15px] text-muted-foreground">{copy.welcome}</p>

          <form noValidate onSubmit={submit} onPointerDown={takeOver} onKeyDown={takeOver} className="mt-8 flex flex-col gap-3">
            {/* Labels sit inside the fields: in the middle while empty, shrinking to the top once you focus or type. */}
            {signup ? (
              <Field id={id("name")} label="Full name" error={tried ? nameError : null}>
                <Input
                  id={id("name")}
                  autoComplete="name"
                  placeholder=" "
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={tried && !!nameError}
                  aria-describedby={tried && nameError ? id("name-error") : undefined}
                  className={FIELD}
                />
              </Field>
            ) : null}

            <Field id={id("email")} label={signup ? "Work email" : "Email"} error={tried ? emailError : null}>
              <Input
                id={id("email")}
                type="email"
                autoComplete="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={tried && !!emailError}
                aria-describedby={tried && emailError ? id("email-error") : undefined}
                className={FIELD}
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <div className="relative">
                <Input
                  id={id("password")}
                  type={show ? "text" : "password"}
                  autoComplete={signup ? "new-password" : "current-password"}
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={tried && !!passwordError}
                  aria-describedby={tried && passwordError ? id("password-error") : undefined}
                  className={cn(FIELD, "pr-10")}
                />
                <Label htmlFor={id("password")} className={FLOAT_LABEL}>
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {show ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                </button>
              </div>
              <div className="flex items-start justify-between gap-3 px-1">
                {tried && passwordError ? (
                  <p id={id("password-error")} className="text-xs text-destructive">
                    {passwordError}
                  </p>
                ) : signup ? (
                  <p className="text-xs text-muted-foreground">At least 8 characters</p>
                ) : (
                  <span />
                )}
                {signup ? null : (
                  <button
                    type="button"
                    onClick={() =>
                      toast(emailError ? "Enter your email first" : "Check your inbox", {
                        description: emailError ? "We'll send the reset link there." : `We sent a reset link to ${email.trim()}.`,
                      })
                    }
                    className="shrink-0 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            </div>

            <Button type="submit" className="mt-1 h-11 w-full" disabled={busy}>
              {busy ? <IconLoader2 className="animate-spin" /> : null}
              {copy.submit}
            </Button>
            {signup ? (
              <p className="text-center text-[11px] leading-4 text-muted-foreground">
                By creating an account, you agree to Appcharge&apos;s Terms of Service and Privacy Policy.
              </p>
            ) : null}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {signup ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link href={signup ? "/login" : "/signup"} className="font-medium text-foreground underline underline-offset-2">
              {signup ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </main>

      {/* The Gradient Tool's animated scene (decorative). Wide screens: a rounded panel on the right, inset 4px (the
          same frame as onboarding's preview); it carries on across Sign in ⇄ Sign up. Tablet and phone: a band across
          the top, above the form. */}
      <aside aria-hidden className="order-first h-[220px] p-1 sm:h-[300px] lg:sticky lg:top-0 lg:order-none lg:h-svh">
        <div className="relative h-full overflow-hidden rounded-[18px] bg-[#2a1f22] lg:min-h-[520px]">
          <GradientScene continueClock className="absolute inset-0" />
        </div>
      </aside>
      {/* Outside the dashboard, so its own toaster (Forgot password). */}
      <Toaster />
    </div>
  );
}

/** A field with its label inside, and its error under it. */
function Field({ id, label, error, children }: { id: string; label: string; error: string | null; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        {children}
        <Label htmlFor={id} className={FLOAT_LABEL}>
          {label}
        </Label>
      </div>
      {error ? (
        <p id={`${id}-error`} className="px-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
