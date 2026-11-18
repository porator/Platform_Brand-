# Usability Test - Projects & Navigation

A copy of Wireframes 004 (`../appcharge-design-system-vs-004`, made 4 Nov 2026) set up for usability
testing as a **first-time user**.

| What | Where |
|---|---|
| App | this folder (Next.js 16, pnpm) |
| Test link (local) | http://localhost:3601/ |

## How it differs from Wireframes 004

- **Intro page** at `/`: who the participant is (an Admin at Product Madness, which has just joined
  Appcharge, with no folders or projects yet), four guidelines and a **Start** button
  (`app/page.tsx`), then **What's your name?** and **Start**, all on one page. Start opens the company's Home.
- **How do you want to start?** On the first landing, a full page in the same split onboarding layout as Create
  project: **Organize with folders** or **Start with one project** (opens Create project, Project Lifecycle PRD),
  with a live preview in the brand colours. Skip for now closes it. Once per session
  (`components/usability/start-choice.tsx`).
- **Set up your folders** (after Organize with folders): name folders and folders inside them, up to 4 levels, names
  unique at each level (Foldering PRD Story 2), or start from an example (By genre / studio / team). The preview
  builds the tree as you type; Create folders adds them to the company and opens the selector, all expanded.
- **Company name**: the participant's company is **Product Madness** (PM logo), brand new.
- **Environment selector** shows inside a project only; hidden at Company and folder level for now.
- **Project sidebar**: inside a project the sidebar and page frame are dark, #272727 (highlight #3A3A3A, light text); Company and
  folder pages keep the light sidebar.
- **Collapsed sidebar flyouts** (Shopify-style): with the sidebar collapsed to icons, pointing at a category opens a
  light flyout (same card as the icon tooltips) with its sub-categories as links; the icon rail stays, with the current category highlighted.
- **Create project, Figma-style**: one question per screen on the left (Which game is it for? → What do you want
  to sell with? → Where should it live? → Choose a store template → Your project is ready), with a progress bar and
  a charcoal Continue pill; on the right, a live preview in the module's brand colour (Webstore navy/blue, Payment
  Links plum/purple, Direct Checkout olive/green, from the Appcharge website in Figma "The Web"). Gellix throughout.
  Modules now have their own screen.
- **Checkout mock**: the Payment Links and Direct Checkout previews show Appcharge's checkout from the Figma
  "Checkout" design, desktop version (node 8478:19551): the offer and totals on the left, payment on the right,
  with the participant's game icon and name.
- **Store mock**: the Webstore previews follow the Figma "Royal Blast" web store (node 5049:4766), filled with the
  game being created (its screenshots, icon and name). Templates: Blank, then by genre Casino (Royal Blast),
  Casual, Midcore.
- **Live preview**: the preview follows the selected modules (hover previews only while pointing); a folder name
  typed in "Create new folder" shows in the tree right away, with the project inside it.
- **First-time structure**: the dashboard's default company is `acme-ft-empty` (named Product Madness, with
  nothing below Company), in `lib/newgen.ts` → `DEFAULT_CLIENT_ID`.
- **No flow bar**: the floating user-flow guide is removed from the shell and from Create project.
- **No menus**: the NewGen menu (grid button) and Review tools (black button) are removed.
- The `/flows` deck is removed.
- **Real store lookup** in Create project, Step 1: an App Store link is read through Apple's public lookup,
  a Google Play link through the store page (`app/api/store-lookup/route.ts`), giving the real title, icon,
  genre and description. Until it answers, or if it can't (offline), the title is guessed from the link.
  The created project then carries that game's name across the dashboard. Needs internet on the test machine.

## New in 011 (top navigation sharp)

Latest round:
- **Starts empty with an intro.** The app opens on the usability-test intro again (name, Start, the three tasks and guidelines); a typed name that's on the Appcharge team shows their avatar. The dashboard is the brand-new, empty Product Madness on every load (the full sample is `?client=product-madness`), and a floating **Test Tasks** chip keeps the tasks one click away.
- **Header and navigation.** One light-grey header across the page: the logo row, then the path as breadcrumbs (company › folders › current ⌄) with the environment in an outlined pill, search and notifications. The current crumb opens **Folders & projects** (white panel): search in the title's place, **filter by module** chips, + New (New folder opens right in the panel), each row's ⋯, filled folder icons and each project's modules under its name. The light-grey sidebar's first item is **Overview** (was Home).
- **Add module** (Module management's Add buttons, ⋯ › Add module, Ask AI) opens a Create-project-style dialog on "How do you want to sell?" with that module checked, then a success step. "Add more" cards look like Your modules' cards.
- **Set up your store:** Option 01–04 tiles without "Best for…", an AI-sparkle Recommended badge, blank as a link; no Skip or "I'll do it later" anywhere.
- The setup checklist and AI assistant dock beside the workspace, under the header.
- **Ask AI does the three tasks:** focused, it offers them as one-click starts; "Create folders called Studio 01 and Studio 02" makes both; "Add a module…" works for any project (named, or picked from a list) and opens the Add module dialog.
- **Overview:** each project row shows its module chips; "Setting up ›" opens that project's setup checklist; "Open folder →". On a project's Overview, the next-step cards have visuals and a module's "Setting up ›" opens the checklist.
- **Orders** says "Not part of this test" (the Orders list and order page stay in components/orders).
- Folders & projects starts with the organization (Product Madness), its folders and projects nested under it; creating a folder takes you into it; the Test Tasks chip drops its count.

- **Scope selector in the top navigation.** Where you are (icon and name, the full path on hover) is the selector at the left of the top bar; it opens Folders & projects as a light panel under it (search, bigger view, + New, each row's ⋯ actions). Picking a folder or project, Escape or a click outside closes it. The sidebar holds only the sections.
- **Top navigation apart from the workspace.** A light bar (in every view, the project sidebar stays dark) with a divider under it: the selector on the left; the environment (in a project), search and notifications on the right. It stays put while the page scrolls.
- **Search in the title's place.** In Folders & projects, Search opens in the title's line with no frame (it slides and fades in from the search icon); closing it (✕, Escape, or leaving it empty) brings the title back.
- **Modules on project rows.** Folders & projects shows each project's modules on a small line under its name (e.g. Webstore · Direct Checkout); B (icons) and C (chips) stay one setting away (`MODULE_MARK`).
- **No skipping.** Skip (store step) and "I'll do it later" (Create project from onboarding, and the onboarding start screen) are removed; the store step also drops the "More templates are coming" note.
- **Sharp workspace.** No rounded corners or outer gap; a hairline also parts it from the light sidebar at company and folder level.

## New in 010

From the 12 Nov design review (navigation and onboarding template selection).

- **One place to navigate: the sidebar.** Folders & projects lives only in the sidebar and is the only folder and project navigation.
  - A scope selector at the top of the sidebar shows where you are (icon, path, name). It opens Folders & projects on top of the section links; picking a folder or project, Escape or a click outside closes it.
  - The top bar drops its breadcrumbs and folder selector: where you are (plain text) on the left; the environment (in a project), search and notifications on the right.
  - Everything the selector did moved into the tree: search, the bigger "All projects" view, + New folder / New project, and each row's ⋯ menu (pin, access, new sub-folder, rename, move, delete; for projects, environments, settings and modules).
  - The account menu's "Navigation" switch is gone. Not carried over: module filter chips and module badges under project names.
- **Company Home groups by top-level folder.** One card per studio (Big Fish, Evergreen) holding each game folder and its projects, with Open folder at both levels.
- **Set up your store is one choice: the layout.**
  - Four tiles in a 2 × 2 grid, named Option 01–04 for now: three single-page layouts (3 in a row, 1 in a row, gallery; "Best for monetization") and the multi-page Game portal ("Best for engagement"). Option 01 is Recommended.
  - The genre isn't asked; it's read from the game's store link and styles the store. Multi-page is a layout, not a separate question.
  - Blank is a small link ("Or start with a blank store"); picked, the tiles deselect and it offers Undo.
  - The AI "Describe your store" step is off for now (`DESCRIBE_STEP` in create-project-flow.tsx), so the step ends with Create project.

## New in Orders-009

Branched from 007 (c5cc87f), with 007's navigation. Orders, built from the PRDs (Module Management Story 3, Soft
Currency Story 12, Bonus Coupons, Post-Purchase Upsell, Kabam Subscriptions, Orders: Overview, Foldering Stories 7–8)
and the design system `@appcharge/newgen-system-design` (vendored in `components/newgen-system-design`). Flow,
sources, open questions and design-system gaps: `docs/orders-flow.md`.

- **Orders list** (project, folder and Company), laid out after the reference recording.
  - **Layout:** a floating toolbar (date range, "Search and filter", clear, show / hide filters, Sort & columns) above a frameless table with a grey header band and row lines, then a "1–25 of N" pager. Every cell, IDs included, is 14px Manrope.
  - **Search:** order, player, transaction, receipt and subscription IDs.
  - **Filters:** added from the search field as a multi-select (checkboxes, Select all / Clear, Done) and shown as chips: Order type, Module, Status, Offer type, Device OS; Project and Environment at folder level.
  - **Columns:** per the Module Management PRD (show / hide, reset).
  - **Badges:** Test and Upsell.
- **Order page** (`?order=<id>`), laid out after the reference.
  - **Top row:** back arrow with an "Orders / ID" breadcrumb; Refund and previous / next on the right.
  - **Title and banner:** the order ID, a "player · date · module · type" line, and a status banner tinted by status.
  - **Main column**, titles above cards: Products (bonus coupon lines), Payment (label · detail · amount, Total, then fee and net), Subscription plan, a History timeline, and Metadata (Formatted / Raw).
  - **Side column:** plain sections (Player, Soft currency, Order, Subscription, Upsell links), no cards.
- Mock orders come from `lib/orders.ts`. Refunds stay in memory until a reload.
- **Fonts come from the design system** (`newgen-system-design/src/styles/fonts.css`, vendored with its files instead of `next/font/google`): Manrope for the UI and page titles, Geist Mono for code, Gellix for onboarding and Create project.
- The project Overview note now reads "Sales and analytics… aren't part of this test".

## New in 007

Branched from 005 (727a9af). Navigation aligned with the Foldering PRD, plus visual polish.

- **Sidebar follows the Foldering PRD tabs.** Folder view: Developer › Activity Logs & Errors, Finance › Reports.
  Project view: Personalization removed from Developer (its checklist step now points to API & Integrations);
  Studio, LiveOps and Localization show only when the project has a module.
- **Sidebar behavior.** Clicking a category opens its first page; only one category is open at a time; only the
  selected page is highlighted (not its category). Item text at 70% (sub-items 60%), white on hover and when a
  category is expanded; hover background at half strength; sub-items span the full 196px row.
  "+ Add module" moved to the sidebar footer, which follows the same text and hover rules.
- **Colors.** Workspace background #FCFCFC (`--workspace` token); the Company/folder sidebar matches it.
- **Project Home.** "Get started with {project}" header; three Next steps cards with an empty gradient image area,
  secondary xs buttons; secondary "+ Add module" on the Modules card.
- **Cards.** One soft drop shadow (`shadow-card`) on workspace cards and the shared Card component.
- **Top bar.** Search is an icon button (no ⌘K badge; ⌘K still opens it), next to a Notifications bell with an
  empty state.
- **Search (⌘K).** Rebuilt Shopify-style: Projects, Folders, Pages and Modules, a "/" filter list, keyboard
  navigation.
- **Setup checklist.** Steps as a borderless timeline: dashed rings for open steps, joined by a thin line.
- **Create project and folder selector** refinements (folder dropdown with rename/delete, store experience
  cards, 450px selector with module chips).

## New in 005

Design tasks from Usability Test 01 (Findings & Recommendations, R1–R22), plus review tooling.

- **Review page** (`/dashboard/review`): every change with a link that sets up sample data and opens the exact
  screen, without the intro. `/dashboard/review?go=<id>` opens one directly (e.g. `?go=r14-move`).
- **R11** Create project no longer reopens when you come back to the page it was opened from.
- **R12** The empty Home says "Start by organizing your company" and has New folder next to Create project.
- **R14** The company reads as "Top level" in the selector and "(top level)" in folder pickers; after a folder is
  created while projects sit at the top level, the toast offers "Move N projects here" (checkbox dialog).
- **R15** Misspelled game names find near matches ("Did you mean …?"), including the company's own games; a name
  with no store match must be picked as "It's not on the App Store"; the project-name hint explains the game prefix.
- **R16** No "name taken" flash after creating a folder; the setup checklist lists shared steps once; clone search
  keeps the picked project; the sidebar logo goes Home (no flyout over the sidebar); Open store shows a store preview.
- **R17** "+ Add module" in the project sidebar and on project Home.
- **R18** The selector is titled "Folders & projects"; picking a folder lands on its Home; a sidebar folder-tree
  variant for the comparison test (account menu › Navigation); R6: New folder shows the new folder's path.
- **R19** Ask AI: folder requests make folders, descriptions are never used as game names, store links give the
  title, "in the X folder" sets the destination, and "add Payment Links" in a project means that project.
- **R20** "Go to project" opens project Home with next steps (Open store, Setup checklist, Add module, Move).
- **R22** Sandboxes keep their own colours in test mode; new sandboxes get an unused colour.
- **R3** The module step asks "How do you want to sell?".
- **Other:** compact search button (top right); page title 48px below the top bar; ⋯ always visible in the
  selector; equal padding on the empty-state buttons; on "Where should it live?", a folder made in this run can be
  renamed or deleted from the Folder dropdown (pencil and bin, Undo after delete); the chosen folder shows a blue
  open-folder icon; dropdown rows share one height.
- **Direct Checkout onboarding plan:** project Home shows "Direct Checkout onboarding · Step n of 7" with View plan,
  which opens a dialog laid out like Create project: the ~3-week plan from Confluence (Onboarding - Web Checkout) in
  7 steps on the left, the chosen step on the right (checkout flow for the solution call, go-live steps for the
  Sandbox step). The current step follows the setup checklist.
- **Toasts** use the dashboard's font, 16px corners and its dark pill action button; adding a module confirms with a
  toast (Open checklist) instead of a banner. "Open store" is now "Preview store".
- **All projects:** the folder tree opens fully expanded with a chevron on every folder, and lists each folder's
  projects (clicking one shows it highlighted in its folder); no New project button in the header. On "Where should
  it live?", Create folder is a secondary button.
- **No intro:** the prototype opens straight on the dashboard Home (`/` redirects there); a refresh or a direct link
  no longer starts over at the name screen. The signed-in user shows as "Alex Morgan".
- **Game icons in the Product Madness sample data:** projects show their game's icon (`public/games/`), and its
  folders are studio › game › project (e.g. Evergreen › Heart of Vegas › HOV Store).

## New in 004

- **Game search with choices**: on "Which game is it for?" a typed name lists up to 3 App Store matches (icon,
  publisher, genre) plus "It's not on the App Store"; the participant picks one before Continue
  (`/api/store-lookup?name=…&all=1`).
- **Module step without movement**: the module cards keep one size; "What you get" opens from an ⓘ beside each name
  (popover), and the preview changes only on click.
- **Clone summary as chips**: "Cloning from" with the game icon, then **Copied** and **Starts fresh** as short icon
  chips (detail on hover), and a one-line access note.
- **Back from "Your project is ready"**: returns to the last step with the choices kept and takes the just-created
  project out again, so creating again makes no duplicate.
- **All projects (bigger view)**: the scope selector stays the small dropdown, with an expand button beside its
  search that opens All projects: folder tree with counts on the left, the chosen folder's breadcrumb, sub-folders and
  projects on the right, search across every level, project-type filters (Webstore, Direct Checkout, Payment Link,
  AppDirect), New project, New folder, Move and Clone (`components/dashboard/all-projects-view.tsx`).
- **Folder Home split by folder**: one card per folder (this folder first, then each sub-folder) with its projects.
- **"Not part of this test"**: in test mode, unbuilt pages (project Home, Transactions, Analytics, folder tabs such
  as Orders) say so instead of showing skeletons.
- **Design-system dropdowns** in Create project (Folder with the company avatar, clone environment) and New folder
  (Location); pointer cursor on every clickable control; equal-width Add buttons in Module management; no logo on
  the success screen.
- **Store steps**: "Set up your store" has the store experience and structure on one screen; the AI prompt moved to
  its own optional step, **Describe your store**. Its + uploads photos of the current store, which are read in the
  browser to pick the layout style and colours for the preview (a stand-in for real layout matching; nothing is
  uploaded).
- **Module management as cards**: "Your modules" (cover, status, setup progress, Open checklist) above "Add more"
  (cover cards with Add or Coming soon). Covers from Figma "Interface — Editor Tool" (`public/modules/`).
- **Setup checklist docked** beside the page like the AI drawer (one drawer at a time); the page frame keeps rounded
  corners and an equal gap above and below, with its content scrolling inside.
- **Move: access changes made visible**: counts per kind (lose / role change / gain) and one coloured row per person;
  the demo Product Madness company has sample folder grants so a Move shows them (e.g. Heart of Vegas from Evergreen
  to Big Fish Casino).
- **Buttons**: dark buttons are pills (200px radius) with a #272727 → #302F2F gradient and shadow/md, no outline;
  every button is 2px taller. Production in the top bar matches the breadcrumb text; no module heading in the
  project sidebar.
- **Sidebar categories expand in place**: a category opens and closes under its name (chevron) instead of drilling
  into its own list; the one holding the current page opens by itself. Breadcrumb links get a 28px hover box.
- **Search at the top right** of the workspace, beside the page tabs, instead of in the sidebar.
- **Undo a new folder** on "Where should it live?": a folder made in this run shows "You just created …" with
  Rename and Delete (while it is empty), and Delete offers Undo.
- **Icons in the ⋯ menus** of projects and folders, and the ⋯ button always shows (not only on hover) (pin, settings, access, add module, new sub-folder, rename, move,
  delete).

## New in 003

- **Intro task**: the intro gives three tasks: organize your company (folders), create a new project, and add a
  module to an existing project. The company is Product Madness.
- **Start with one project first**: on "How do you want to start?" the project path is the primary, preselected
  option; "Or organize with folders first" is a smaller link below it. Both paths are kept.
- **Skip and hand-off on every onboarding step**: "I'll do it later" skips the current step; "I'm not the right
  person" opens an invite step in the same split layout (email, role, note, with a live invite-email preview),
  then closes onboarding.
- **Clone** in Create project shows only when the company already has projects.
- **Orientation after onboarding**: breadcrumbs mark each level (company logo, folder, game icon) with
  "Organization / Folder / Project" tooltips, and a summary under the page title gives the level, its parents and
  what it holds (folders, projects or modules).
- **Module cards** explain what each module offers ("What you get") on hover or focus.
- **Store template step** (now "Set up your store", below):
  - The game's store page is analysed: genre, screenshots, and the icon and first screenshot (read through
    `app/api/image`, App Store and Google Play image hosts only) for brand colours and art style
    (`lib/game-palette.ts`).
  - **Blank** comes first (an empty store, built your own way or with the AI expert), then the genre templates:
    **Casino**, **Casual** and **Midcore**.
  - A genre template is recommended from that (casino → Casino, puzzle and word → Casual, action and strategy →
    Midcore; otherwise by the art's style). Each genre card says what the genre means; the recommended one adds
    "Based on the store link you added for your game." The recommended template is selected by default; changing
    the game resets an earlier pick. The subtitle says what was read.
  - The live preview uses the game's art and puts its brand colour on the buttons; hovering a template previews it.
  - Sample offers are always on (no toggle); Blank starts empty. There is no "Personalize with AI" prompt.
  - The created project keeps the template, sample content and brand colours ("Your project is ready"
    no longer lists them).
  - Template icons are one-grey line sketches of each layout.
- **After onboarding**: "Your project is ready" has **Go to dashboard** (was "Go to setup checklist"). It opens
  the new project with the scope selector open, its folder path expanded and its row outlined; the Setup checklist
  stays in the sidebar.
- **Add module** in a project's ⋯ menu opens that project's Administration › Module management (no sub-menu);
  with every module added it reads Manage modules.

- **Start lands on the dashboard**: Start on the intro opens Product Madness's Home directly; the "How do you want
  to start?" screen is not shown for now (`components/usability/start-choice.tsx` is kept).
- **Create project in a dialog**: from the dashboard (a folder's Create project, the scope selector's New project) the
  flow opens in a large dialog over the page, with ✕ and back in its top corners, a pinned progress + Continue row,
  and only the middle scrolling (`components/dashboard/create-project-modal.tsx`; the flow itself is
  `components/dashboard/create-project-flow.tsx`, still a full page at `/dashboard/create-project`).
- **Modules step**: compact cards with one short line each.
- **Set up your store** (one step): Store experience (Blank, or the recommended genre, with "Explore other genres":
  Casino, Casual, Midcore, Other genres) and Store structure (Single page / Multiple pages, previewed on hover), two
  independent choices saved on the project as `storeExperience` and `storeStructure`. An inline Ask AI bar (no side
  panel) takes a description: a genre or structure named in it is picked, and its look tints the preview.
- **Ask AI**: the bar always shows +, microphone and a side-panel button, with the Appcharge logo as a flipping coin.
  Sending a prompt, or the side-panel button, opens the assistant as a drawer docked in the workspace (the page
  narrows; no overlay): Recents and controls on top, "Where should we begin?", and the prompt below. Create-project
  requests are answered there with the project card (`components/dashboard/assistant-drawer.tsx`).
- **Projects list**: each project shows its store setup status ("Setting up · done/total" with a bar, else Live).

- **Team avatars**: a name typed on the intro that belongs to someone on the Appcharge team (the test session's invite
  list) shows their picture as the signed-in user, or their initials on their colour (`lib/team.ts`,
  `public/avatars/team/`). Anyone else keeps plain initials.
- **Sidebar width**: 220px (was 240px).

- **Sidebar motion**: moving to another context (a folder, a project, a category's own menu, and back) loads the
  sidebar's categories in: each fades in and slides 12px from the left (320ms, 35ms apart). Nothing else moves; the
  page itself no longer animates (`components/dashboard/nav-motion.tsx`).

Everything a participant does lives in memory: a full page reload starts them over as a new user.

## Run it

```bash
pnpm install
pnpm exec next dev -p 3601
```

Then open http://localhost:3601/ and click **Next**, enter a name, then **Start**.
