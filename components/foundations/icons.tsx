"use client";

import * as React from "react";
import type { Icon as AppIcon } from "@/lib/icons";
import {
  IconLayoutDashboard, IconLayoutSidebar, IconLayoutSidebarRight, IconLayoutGrid,
  IconLayoutColumns, IconLayoutList, IconLayoutNavbar, IconLayoutKanban, IconSitemap,
  IconHierarchy, IconHierarchy2, IconBinaryTree, IconFolder, IconFolderOpen, IconFolders,
  IconFile, IconFiles, IconFileText, IconHome, IconChevronRight, IconChevronLeft,
  IconChevronDown, IconChevronUp, IconChevronsLeft, IconChevronsRight, IconArrowLeft,
  IconArrowRight, IconArrowUp, IconArrowDown, IconArrowBack, IconMenu2, IconDots,
  IconDotsVertical, IconGripVertical, IconSearch, IconFilter, IconSettings, IconAdjustments,
  IconAdjustmentsHorizontal, IconPlus, IconMinus, IconX, IconCheck, IconExternalLink,
  IconLink, IconMap, IconMapPin, IconRoute, IconStack2, IconColumns, IconColumns3, IconBox,
  IconPackage, IconApps, IconComponents, IconUser, IconUsers, IconBell, IconBookmark,
  IconStar, IconTag, IconFlag, IconPin, IconEye, IconEyeOff, IconPencil, IconTrash, IconCopy,
  IconDownload, IconUpload, IconRefresh, IconTable, IconList, IconListTree, IconListDetails,
  IconDatabase, IconServer, IconTerminal2, IconCode, IconGitBranch, IconRocket,
  IconPlayerPlay, IconCircleCheck, IconAlertTriangle, IconInfoCircle, IconLoader2,
  IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet,
} from "@/lib/icons";
import { PageShell, PageHeader, Section, Mono } from "./_kit";

export type Entry = { name: string; Icon: AppIcon };

export const ICONS: Entry[] = [
  { name: "LayoutDashboard", Icon: IconLayoutDashboard },
  { name: "LayoutSidebar", Icon: IconLayoutSidebar },
  { name: "LayoutSidebarRight", Icon: IconLayoutSidebarRight },
  { name: "LayoutGrid", Icon: IconLayoutGrid },
  { name: "LayoutColumns", Icon: IconLayoutColumns },
  { name: "LayoutList", Icon: IconLayoutList },
  { name: "LayoutNavbar", Icon: IconLayoutNavbar },
  { name: "LayoutKanban", Icon: IconLayoutKanban },
  { name: "Sitemap", Icon: IconSitemap },
  { name: "Hierarchy", Icon: IconHierarchy },
  { name: "Hierarchy2", Icon: IconHierarchy2 },
  { name: "BinaryTree", Icon: IconBinaryTree },
  { name: "Folder", Icon: IconFolder },
  { name: "FolderOpen", Icon: IconFolderOpen },
  { name: "Folders", Icon: IconFolders },
  { name: "File", Icon: IconFile },
  { name: "Files", Icon: IconFiles },
  { name: "FileText", Icon: IconFileText },
  { name: "Home", Icon: IconHome },
  { name: "ChevronRight", Icon: IconChevronRight },
  { name: "ChevronLeft", Icon: IconChevronLeft },
  { name: "ChevronDown", Icon: IconChevronDown },
  { name: "ChevronUp", Icon: IconChevronUp },
  { name: "ChevronsLeft", Icon: IconChevronsLeft },
  { name: "ChevronsRight", Icon: IconChevronsRight },
  { name: "ArrowLeft", Icon: IconArrowLeft },
  { name: "ArrowRight", Icon: IconArrowRight },
  { name: "ArrowUp", Icon: IconArrowUp },
  { name: "ArrowDown", Icon: IconArrowDown },
  { name: "ArrowBack", Icon: IconArrowBack },
  { name: "Menu2", Icon: IconMenu2 },
  { name: "Dots", Icon: IconDots },
  { name: "DotsVertical", Icon: IconDotsVertical },
  { name: "GripVertical", Icon: IconGripVertical },
  { name: "Search", Icon: IconSearch },
  { name: "Filter", Icon: IconFilter },
  { name: "Settings", Icon: IconSettings },
  { name: "Adjustments", Icon: IconAdjustments },
  { name: "AdjustmentsHorizontal", Icon: IconAdjustmentsHorizontal },
  { name: "Plus", Icon: IconPlus },
  { name: "Minus", Icon: IconMinus },
  { name: "X", Icon: IconX },
  { name: "Check", Icon: IconCheck },
  { name: "ExternalLink", Icon: IconExternalLink },
  { name: "Link", Icon: IconLink },
  { name: "Map", Icon: IconMap },
  { name: "MapPin", Icon: IconMapPin },
  { name: "Route", Icon: IconRoute },
  { name: "Stack2", Icon: IconStack2 },
  { name: "Columns", Icon: IconColumns },
  { name: "Columns3", Icon: IconColumns3 },
  { name: "Box", Icon: IconBox },
  { name: "Package", Icon: IconPackage },
  { name: "Apps", Icon: IconApps },
  { name: "Components", Icon: IconComponents },
  { name: "User", Icon: IconUser },
  { name: "Users", Icon: IconUsers },
  { name: "Bell", Icon: IconBell },
  { name: "Bookmark", Icon: IconBookmark },
  { name: "Star", Icon: IconStar },
  { name: "Tag", Icon: IconTag },
  { name: "Flag", Icon: IconFlag },
  { name: "Pin", Icon: IconPin },
  { name: "Eye", Icon: IconEye },
  { name: "EyeOff", Icon: IconEyeOff },
  { name: "Pencil", Icon: IconPencil },
  { name: "Trash", Icon: IconTrash },
  { name: "Copy", Icon: IconCopy },
  { name: "Download", Icon: IconDownload },
  { name: "Upload", Icon: IconUpload },
  { name: "Refresh", Icon: IconRefresh },
  { name: "Table", Icon: IconTable },
  { name: "List", Icon: IconList },
  { name: "ListTree", Icon: IconListTree },
  { name: "ListDetails", Icon: IconListDetails },
  { name: "Database", Icon: IconDatabase },
  { name: "Server", Icon: IconServer },
  { name: "Terminal2", Icon: IconTerminal2 },
  { name: "Code", Icon: IconCode },
  { name: "GitBranch", Icon: IconGitBranch },
  { name: "Rocket", Icon: IconRocket },
  { name: "PlayerPlay", Icon: IconPlayerPlay },
  { name: "CircleCheck", Icon: IconCircleCheck },
  { name: "AlertTriangle", Icon: IconAlertTriangle },
  { name: "InfoCircle", Icon: IconInfoCircle },
  { name: "Loader2", Icon: IconLoader2 },
  { name: "DeviceDesktop", Icon: IconDeviceDesktop },
  { name: "DeviceMobile", Icon: IconDeviceMobile },
  { name: "DeviceTablet", Icon: IconDeviceTablet },
];

const STROKES = [1, 1.5, 2] as const;

export function IconsPage() {
  const [query, setQuery] = React.useState("");
  const [stroke, setStroke] = React.useState<number>(1.5);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICONS;
    return ICONS.filter((e) => e.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <PageShell>
      <PageHeader
        title="Icons"
        description={
          <>
            One icon system: <strong className="text-foreground">Phosphor Icons</strong>, imported
            per-icon from <Mono>@/lib/icons</Mono> (from <Mono>@phosphor-icons/react</Mono>). They inherit{" "}
            <Mono>currentColor</Mono>, so they adapt to theme and context automatically. The set
            below is curated around navigation & project structure.
          </>
        }
      />

      <Section
        title="Sizes & stroke"
        description="Icons scale cleanly and share a consistent stroke. 20–24px suits most UI; 16px for dense rows."
      >
        <div className="flex flex-wrap items-end gap-8 border border-border bg-card p-6 text-card-foreground">
          {[16, 20, 24, 32].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <IconSitemap size={s} stroke={stroke} className="text-foreground" />
              <Mono className="text-muted-foreground">{s}px</Mono>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5">
            {STROKES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStroke(s)}
                className={`h-8 border px-3 text-sm transition-colors ${
                  stroke === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
            <span className="ml-1">
              <Mono className="text-muted-foreground">stroke</Mono>
            </span>
          </div>
        </div>
      </Section>

      <Section
        title="Gallery"
        description={`${ICONS.length} curated icons. Filter by name.`}
      >
        <div className="relative mb-5 max-w-sm">
          <IconSearch
            size={16}
            stroke={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
            className="h-9 w-full border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            No icons match <Mono>{query}</Mono>.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filtered.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2.5 bg-background px-2 py-5 text-center"
                title={`Icon${name}`}
              >
                <Icon size={24} stroke={stroke} className="text-foreground" />
                <span className="w-full truncate text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </PageShell>
  );
}
