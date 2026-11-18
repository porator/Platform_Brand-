import { NextResponse } from "next/server";

/**
 * Store lookup for Create project, Step 1 (Project Lifecycle PRD, Story 1): a store link fills in the game's
 * title, icon, genre and description. Runs on the server, so the browser never hits Apple or Google directly.
 *
 *   App Store   — Apple's public lookup API, by the app's id ("…/id553834731").
 *   Google Play — the store page's Open Graph tags (Google has no public lookup API).
 *
 *   ?name=      — a typed game name, matched against the App Store's search (see appStoreByName);
 *                 add &all=1 for up to three matches ({ results }).
 *
 * Returns 404 when nothing can be read; the wizard then keeps the title it guessed from the link (or the name typed).
 */
type StoreGame = { title: string; genre?: string; description?: string; icon?: string; seller?: string; screenshots?: string[] };

const TIMEOUT_MS = 4000;
/** Store categories too broad to be useful as a genre. */
const BROAD = new Set(["Games", "Entertainment"]);

const firstSentence = (text = "") => {
  const flat = text.replace(/\s+/g, " ").trim();
  const m = flat.match(/^.{20,180}?[.!?](\s|$)/);
  return (m ? m[0] : flat.slice(0, 160)).trim();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApple(app: any): StoreGame | null {
  if (!app?.trackName) return null;
  const genres: string[] = (app.genres ?? [app.primaryGenreName]).filter((g: string) => g && !BROAD.has(g));
  return {
    title: app.trackName,
    genre: genres.slice(0, 2).join(" · ") || app.primaryGenreName,
    description: firstSentence(app.description),
    icon: app.artworkUrl512 ?? app.artworkUrl100,
    seller: app.sellerName,
    // The store's screenshots (key art and game scenes), at twice the listing's thumbnail size so they stay sharp in
    // the template previews. They fill the previews' hero banner and offer tiles.
    screenshots: ((app.screenshotUrls?.length ? app.screenshotUrls : app.ipadScreenshotUrls) ?? [])
      .slice(0, 6)
      .map((u: string) => u.replace(/\/\d+x\d+bb\.(jpg|png|webp)$/, "/640x960bb.$1")),
  };
}

async function appStore(url: URL): Promise<StoreGame | null> {
  const id = url.pathname.match(/\/id(\d+)/)?.[1];
  if (!id) return null;
  const country = url.pathname.match(/^\/([a-z]{2})\//i)?.[1] ?? "us";
  const res = await fetch(`https://itunes.apple.com/lookup?id=${id}&country=${country}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) return null;
  return fromApple((await res.json()).results?.[0]);
}

/** A typed game name: the App Store's matches, but only ones whose title contains every word typed
 *  ("jackpot magic" → Jackpot Magic Slots & Casino), so a made-up name never borrows another game's icon. Games
 *  come first; at most `limit`. */
/** Edit distance between two short words (typos: a missing, extra, swapped or wrong letter). */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** A typed word is close to a title word: the same start, or a typo or two away ("lightnig" → "lightning"). */
const nearWord = (w: string, t: string) => {
  const allowed = w.length >= 6 ? 2 : w.length >= 4 ? 1 : 0;
  return t.startsWith(w) || distance(w, t.slice(0, w.length)) <= allowed || distance(w, t) <= allowed;
};

async function searchApple(term: string) {
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=25&country=us`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return res.ok ? (((await res.json()).results ?? []) as any[]) : [];
}

/** Matches for a typed name, plus whether they're only near matches (R15: "Did you mean …?"). */
async function appStoreByNameNear(name: string, limit: number): Promise<{ results: (StoreGame & { id: string })[]; near: boolean }> {
  const exact = await appStoreByName(name, limit);
  if (exact.length) return { results: exact, near: false };
  const words = name.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (!words.length || name.trim().length < 3) return { results: [], near: false };
  // The store's own search often forgives a typo; if not, search by the longest word alone and filter by closeness.
  const longest = [...words].sort((a, b) => b.length - a.length)[0];
  const pool = [...(await searchApple(name.trim())), ...(longest !== name.trim().toLowerCase() ? await searchApple(longest.slice(0, Math.max(3, longest.length - 2))) : [])];
  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hits = pool.filter((app: any) => {
    const id = String(app.trackId);
    if (seen.has(id)) return false;
    seen.add(id);
    const title: string[] = String(app.trackName ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
    return words.every((w) => title.some((t) => nearWord(w, t)));
  });
  return { results: rank(hits, limit), near: hits.length > 0 };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isGame = (app: any) => (app.genreIds ?? []).includes("6014") || app.primaryGenreName === "Games";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rank(hits: any[], limit: number): (StoreGame & { id: string })[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ranked = [...hits.filter(isGame), ...hits.filter((app: any) => !isGame(app))];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ranked.slice(0, limit).flatMap((app: any) => {
    const game = fromApple(app);
    return game ? [{ ...game, id: String(app.trackId) }] : [];
  });
}

async function appStoreByName(name: string, limit = 1): Promise<(StoreGame & { id: string })[]> {
  const words = name.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (!words.length || name.trim().length < 3) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hits = (await searchApple(name.trim())).filter((app: any) => {
    const title: string[] = String(app.trackName ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
    return words.every((w) => title.some((t) => t.startsWith(w)));
  });
  return rank(hits, limit);
}

async function googlePlay(url: URL): Promise<StoreGame | null> {
  const id = url.searchParams.get("id");
  if (!id) return null;
  const res = await fetch(`https://play.google.com/store/apps/details?id=${encodeURIComponent(id)}&hl=en`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { "Accept-Language": "en" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const meta = (prop: string) => html.match(new RegExp(`<meta[^>]+property="${prop}"[^>]+content="([^"]*)"`, "i"))?.[1];
  const title = meta("og:title")?.replace(/\s*-\s*Apps on Google Play$/i, "");
  if (!title) return null;
  const genre = html.match(/itemprop="genre"[^>]*>([^<]+)</i)?.[1];
  return { title, genre, description: firstSentence(meta("og:description")), icon: meta("og:image") };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const name = params.get("name");
  if (name !== null) {
    try {
      // ?all=1 — up to three matches to choose from (Create project lists them); otherwise the best one.
      if (params.get("all")) return NextResponse.json(await appStoreByNameNear(name, 3));
      const [game] = await appStoreByName(name);
      return game ? NextResponse.json(game) : NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ error: "Store unreachable" }, { status: 404 });
    }
  }
  const raw = params.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Not a URL" }, { status: 400 });
  }
  try {
    const game = url.host === "apps.apple.com" ? await appStore(url) : url.host === "play.google.com" ? await googlePlay(url) : null;
    return game ? NextResponse.json(game) : NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Store unreachable" }, { status: 404 });
  }
}
