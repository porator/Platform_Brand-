/**
 * The organization set up in onboarding (app/onboarding): its name, website, logo and brand colours. Kept for the
 * session and written into the first-time company's record, so every place that shows the company (breadcrumb,
 * logo, Overview banner, root folder) shows yours.
 */
import { CLIENTS, type ClientId } from "@/lib/newgen";

export type Organization = {
  name: string;
  website?: string;
  /** A small square PNG (data URL), made from the uploaded logo. */
  logo?: string;
  /** Read from the logo, most characteristic first. */
  brandColors?: string[];
};

/** The company a new user lands in (empty: no folders, no projects yet). */
export const ONBOARDING_CLIENT: ClientId = "acme-ft-empty";
export const ONBOARDING_HOME = `/dashboard/company/home?client=${ONBOARDING_CLIENT}`;
const KEY = "appcharge-organization";

export const initialsOf = (name: string) =>
  (name.trim().match(/\S+/g) ?? ["?"])
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export function readOrganization(): Organization | null {
  try {
    const v = sessionStorage.getItem(KEY);
    return v ? (JSON.parse(v) as Organization) : null;
  } catch {
    return null;
  }
}

/** Writes the organization into the company record (in memory). Returns whether anything changed. */
export function applyOrganization(org: Organization): boolean {
  const c = CLIENTS[ONBOARDING_CLIENT];
  const next = {
    ...c.company,
    name: org.name,
    initials: initialsOf(org.name),
    logo: org.logo,
    brandColors: org.brandColors?.length ? org.brandColors : undefined,
  };
  const same = c.company.name === next.name && c.company.logo === next.logo && c.company.brandColors?.join() === next.brandColors?.join();
  if (!same) c.company = next;
  return !same;
}

export function saveOrganization(org: Organization) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(org));
  } catch {}
  applyOrganization(org);
}

/** A square PNG of the logo (up to 160px), cropped to fit, for the session and the dashboard's round marks. */
export function logoDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const size = 160;
        const c = document.createElement("canvas");
        c.width = c.height = size;
        const g = c.getContext("2d");
        if (!g) return resolve(null);
        const s = Math.min(img.naturalWidth, img.naturalHeight);
        g.drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
        resolve(c.toDataURL("image/png"));
      } catch {
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}
