import { NextResponse } from "next/server";

/**
 * Same-origin copy of a game's store image (icon, screenshot), so the browser can read its pixels to find the game's
 * brand colours (lib/game-palette.ts). Only the app stores' image hosts are allowed.
 */
const ALLOWED = [/\.mzstatic\.com$/, /^play-lh\.googleusercontent\.com$/];

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url") ?? "";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Not a URL" }, { status: 400 });
  }
  if (url.protocol !== "https:" || !ALLOWED.some((h) => h.test(url.host))) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(res.body, {
      headers: {
        "content-type": res.headers.get("content-type") ?? "image/jpeg",
        "cache-control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image unreachable" }, { status: 404 });
  }
}
