"use client";

import * as React from "react";
import { GradientScene } from "@/components/gradient-tool/gradient-scene";

/*
 * Sign in → dashboard: a simple fade. The sign-in page fades out to white and sets a flag; the dashboard opens under a
 * white cover that fades away.
 */

const FLAG = "appcharge-signin-transition";
const listeners = new Set<() => void>();

/** Called by the sign-in page right before it navigates. */
export function markSignInTransition() {
  try {
    sessionStorage.setItem(FLAG, "1");
  } catch {}
}

function pending() {
  try {
    return sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}
function clear() {
  try {
    sessionStorage.removeItem(FLAG);
  } catch {}
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Mounted once in the dashboard: fades in from white, only right after signing in. */
export function SignInReveal() {
  const show = React.useSyncExternalStore(subscribe, pending, () => false);
  if (!show) return null;
  return (
    <div aria-hidden className="signin-reveal pointer-events-none fixed inset-0 z-[200] bg-white" onAnimationEnd={clear} />
  );
}

/* ── Sign in → onboarding: the same animated panel, handed over ─────────────────────────────────────────────────── */
const HANDOFF = "appcharge-signin-handoff";

/** Called by the sign-in page right before it goes to onboarding. */
export function markSignInHandoff() {
  try {
    sessionStorage.setItem(HANDOFF, "1");
  } catch {}
}
function handoffPending() {
  try {
    return sessionStorage.getItem(HANDOFF) === "1";
  } catch {
    return false;
  }
}
function clearHandoff() {
  try {
    sessionStorage.removeItem(HANDOFF);
  } catch {}
  listeners.forEach((l) => l());
}

/** Mounted in onboarding's panel: the sign-in scene, carrying on where it was, cross-fading into the preview. */
export function SignInHandoff() {
  const show = React.useSyncExternalStore(subscribe, handoffPending, () => false);
  if (!show) return null;
  return (
    <div aria-hidden className="signin-handoff pointer-events-none absolute inset-0 z-10 bg-[#2a1f22]" onAnimationEnd={clearHandoff}>
      <GradientScene continueClock className="absolute inset-0" />
    </div>
  );
}
