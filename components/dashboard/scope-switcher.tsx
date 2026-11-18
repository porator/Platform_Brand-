"use client";

/**
 * The scope selector in the top navigation (design review: one point of navigation): where you are — the company, a
 * folder or a project — with the path in its tooltip. It opens Folders & projects in a panel under it, the one place
 * folders and projects are switched and managed (search, the bigger view, + New, each row's ⋯ actions).
 *
 * A link that lands on the tree (a row's menu or rename, a search, the expanded tree) opens it too. Going to another
 * folder or project, Escape, a click outside it, or the selector again closes it. Menus and dialogs opened from the
 * tree are its own, so they don't close it.
 */

import * as React from "react";
import { createPortal } from "react-dom";
import { IconChevronDown, IconChevronRight, IconFolderFilled } from "@/lib/icons";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFolderTree } from "@/components/dashboard/providers";
import { useSelectorUi } from "@/components/dashboard/folder-selector";
import { SidebarFolderTree } from "@/components/dashboard/sidebar-folder-tree";
import { CompanyMark } from "@/components/dashboard/project-bits";
import { findTrail, isFolderId, isProjectId, trailNames } from "@/lib/folders";
import { ROOT_FOLDER_ID, companyHref, type ClientConfig, type Project } from "@/lib/newgen";

export function ScopeSwitcher({
  client,
  scope,
  project,
  folderId = ROOT_FOLDER_ID,
  sectionId,
  envId,
}: {
  client: ClientConfig;
  scope: "company" | "project";
  project: Project;
  folderId?: string;
  sectionId: string;
  envId: string;
}) {
  const { root } = useFolderTree(client);
  const trail = findTrail(root, scope === "company" ? isFolderId(folderId) : isProjectId(project.id)) ?? [root];
  const names = trailNames(client, trail);

  const [ui, setUi] = useSelectorUi();
  const [picked, setPicked] = React.useState(false);
  const linked = (!!ui.panel && ["locations", "menu", "rename", "new-folder"].includes(ui.panel)) || !!ui.q || !!ui.expand || !!ui.fresh;
  const open = picked || linked;
  // Another folder or project: close.
  const hereKey = scope === "company" ? `f:${folderId}` : `p:${project.id}`;
  const [seenKey, setSeenKey] = React.useState(hereKey);
  if (seenKey !== hereKey) {
    setSeenKey(hereKey);
    setPicked(false);
  }
  const close = () => {
    setPicked(false);
    if (linked) setUi(null);
  };

  const box = React.useRef<HTMLDivElement>(null);
  const panel = React.useRef<HTMLDivElement>(null);
  /* The panel opens on the page (outside the dark header), so it keeps the light theme: placed under the button. */
  const [at, setAt] = React.useState<{ top: number; left: number } | null>(null);
  React.useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = box.current?.getBoundingClientRect();
      if (r) setAt({ top: r.bottom + 6, left: r.left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);
  React.useEffect(() => {
    if (!open) return;
    const POPUPS = '[role="dialog"],[role="alertdialog"],[role="menu"],[role="listbox"]';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented && !document.querySelector(POPUPS)) close();
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (box.current?.contains(t) || panel.current?.contains(t) || t?.closest?.(POPUPS)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, linked]);

  const mark =
    scope === "project" ? (
      project.gameIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.gameIcon} alt="" className="size-4 shrink-0 rounded-[4px] object-cover" />
      ) : (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] bg-muted text-[7px] font-semibold text-muted-foreground">{project.gameInitials}</span>
      )
    ) : folderId === ROOT_FOLDER_ID ? (
      <CompanyMark client={client} />
    ) : (
      <IconFolderFilled className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
    );

  return (
    <nav aria-label="Location" className="flex min-w-0 items-center gap-x-1 text-nav">
      {/* The path: the company and each folder above, links to their Home. */}
      {trail.slice(0, -1).map((n, i) => (
        <React.Fragment key={n.id}>
          <Link
            href={i === 0 ? companyHref(client.id, "home") : companyHref(client.id, "home", n.id)}
            title={names[i]}
            className="inline-flex h-7 max-w-48 items-center gap-1.5 rounded px-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {i === 0 ? <CompanyMark client={client} /> : <IconFolderFilled className="size-3.5 shrink-0" aria-hidden />}
            <span className="truncate">{names[i]}</span>
          </Link>
          <IconChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden />
        </React.Fragment>
      ))}
    {/* Where you are: it opens Folders & projects under it. */}
    <div ref={box} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="folders-and-projects"
        aria-label={`Switch folder or project. Now in ${names.join(" / ")}`}
        title={names.join(" / ")}
        onClick={() => (open ? close() : setPicked(true))}
        className={cn(
          // Light frame: where you are is a white chip (the same chip as the selected page in the sidebar).
          "inline-flex h-7 max-w-64 items-center gap-1.5 rounded-md bg-white px-2 text-nav font-semibold text-foreground shadow-(--raised-pill-shadow) outline-hidden transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-muted/60",
        )}
      >
        {mark}
        <span className="truncate">{names.at(-1)}</span>
        <IconChevronDown className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && at
        ? createPortal(
        <div
          ref={panel}
          id="folders-and-projects"
          style={{ top: at.top, left: at.left }}
          // A white menu: the tree's sidebar colours are pointed at the popover's (light theme, outside the header).
          className="fixed z-40 max-h-[min(32rem,70svh)] w-96 overflow-y-auto rounded-xl border border-border bg-popover py-2 text-popover-foreground shadow-lg [--sidebar-accent:var(--muted)] [--sidebar-accent-foreground:var(--foreground)] [--sidebar-border:var(--border)] [--sidebar-foreground:var(--popover-foreground)] [--sidebar-ring:var(--ring)] [--sidebar:var(--popover)] duration-150 animate-in fade-in-0 slide-in-from-top-1"
        >
          <SidebarFolderTree
            client={client}
            current={scope === "company" ? { kind: "folder", id: folderId } : { kind: "project", id: project.id }}
            sectionId={sectionId}
            envId={envId}
          />
        </div>,
        document.body,
      )
        : null}
    </div>
    </nav>
  );
}
