# newgen-system-design (vendored)

Verbatim copies of the Storybook source of truth, `@appcharge/newgen-system-design`
(`web-store-platform/packages/newgen-system-design/src`, commit `de1aa206`), used by the Orders pages.
Copied rather than installed because the repo deploys from its own Docker build, which can't reach the
package's workspace or private registry. Don't edit them here: change the package, then copy again.

`index.ts` (the barrel) is the only file written here. The package's flagged token gaps
(`NON_SOURCE_TOKENS`: `*-subtle` tints, `border-strong`, `destructive-foreground`) are added to
`app/globals.css`; every other token already comes from this app (the package's tokens were extracted from it).
