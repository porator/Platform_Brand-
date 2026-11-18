import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * The Tailwind 4 default scales are grouped by tailwind-merge already. The dashboard type
 * scale (text-title … text-micro, design-tokens.ts DASHBOARD_TEXT_SCALE) is custom, so it is
 * registered as font sizes: otherwise `cn('text-nav', 'text-muted-foreground')` would read
 * text-nav as a colour and drop it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['title', 'stat', 'section', 'body', 'nav', 'meta', 'micro'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
