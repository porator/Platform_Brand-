import { createCn } from "cn/config"

// The dashboard type scale (app/globals.css → @theme --text-*) registered as
// font sizes, so `cn` merges them against text-sm etc. instead of mistaking
// them for text colours and dropping them.
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["title", "stat", "section", "body", "nav", "meta", "micro"] }] } },
})
