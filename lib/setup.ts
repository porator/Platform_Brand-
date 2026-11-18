/**
 * Setup checklist go-live steps per module (Module Management PRD, Integrations
 * per Module — the Required rows). Steps marked for several modules are set up
 * once per project and shared. Ticking state lives in the dashboard providers.
 */

import type { ModuleId, Project } from "@/lib/newgen";

export type GoLiveStep = { id: string; label: string; modules: ModuleId[]; section: string };

export const GO_LIVE_STEPS: GoLiveStep[] = [
  { id: "secure", label: "Secure communication (request signing)", modules: ["webstore", "payment-links", "direct-checkout"], section: "dev-api" },
  { id: "awarding", label: "Awarding (Grant Award callback)", modules: ["webstore", "payment-links", "direct-checkout"], section: "dev-api" },
  { id: "player-auth", label: "Player Authentication", modules: ["webstore"], section: "dev-auth" },
  { id: "personalization", label: "Personalization callback", modules: ["webstore"], section: "dev-api" },
  { id: "domain-webstore", label: "Webstore domain", modules: ["webstore"], section: "dev-domains" },
  { id: "checkout-session", label: "Checkout Session API (create, cancel)", modules: ["payment-links", "direct-checkout"], section: "dev-api" },
  { id: "domain-payment-links", label: "Payment Links domain", modules: ["payment-links"], section: "dev-domains" },
  { id: "domain-direct-checkout", label: "Direct Checkout domain", modules: ["direct-checkout"], section: "dev-domains" },
];

export const stepsFor = (m: ModuleId) => GO_LIVE_STEPS.filter((s) => s.modules.includes(m));

/**
 * Where a project's modules stand. Modules a live project already had are
 * Live (and their shared steps count as done); any other module is "Setting
 * up" until every one of its go-live steps is done in Production.
 */
export function moduleSetup(project: Project, base: ModuleId[], all: ModuleId[], done: string[], created: boolean) {
  const seedLive = !created && (project.status === "Live" || project.status === "Soft launch") ? base : [];
  const implicit = new Set(GO_LIVE_STEPS.filter((s) => s.modules.some((m) => seedLive.includes(m))).map((s) => s.id));
  const isDone = (id: string) => done.includes(id) || implicit.has(id);
  const isLive = (m: ModuleId) => seedLive.includes(m) || stepsFor(m).every((s) => isDone(s.id));
  const settingUp = all.filter((m) => !isLive(m));
  const steps = GO_LIVE_STEPS.filter((s) => s.modules.some((m) => settingUp.includes(m)));
  return { isDone, isLive, settingUp, steps, projectLive: seedLive.length > 0 };
}
