import { CLIENTS, type ClientId } from "@/lib/newgen";
import { cn } from "@/lib/utils";

/** Product Madness mark — white tornado/funnel on the brand blue. */
function ProductMadnessLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#2546E4" />
      <g fill="#fff">
        <rect x="5.5" y="7" width="13" height="2.4" rx="1.2" />
        <rect x="6.75" y="10.8" width="10.5" height="2.4" rx="1.2" />
        <rect x="8.25" y="14.6" width="7.5" height="2.4" rx="1.2" />
      </g>
    </svg>
  );
}

/** Wooga mark — the purple "W" people (two heads over a W). */
function WoogaLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#fff" />
      <circle cx="8.3" cy="8.2" r="2.1" fill="#5B1AA8" />
      <circle cx="15.7" cy="8.2" r="2.1" fill="#5B1AA8" />
      <path
        fill="none"
        stroke="#5B1AA8"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.6 11.2 L9 18.4 L12 13.8 L15 18.4 L18.4 11.2"
      />
    </svg>
  );
}

/** Neutral placeholder mark for the generic (no-client) structure. */
function GenericLogo({ className, initials = "AC" }: { className?: string; initials?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#6b7280" />
      <text x="12" y="15.6" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="system-ui, sans-serif">
        {initials}
      </text>
    </svg>
  );
}

/** The right company logo for a client. */
export function CompanyLogo({ clientId, className }: { clientId: ClientId; className?: string }) {
  // The company's own logo when it has one (lib/newgen.ts).
  const logo = CLIENTS[clientId]?.company.logo;
  // eslint-disable-next-line @next/next/no-img-element -- a small static brand mark
  if (logo) return <img src={logo} alt="" aria-hidden className={cn("rounded-full object-cover", className)} />;
  if (clientId === "generic") return <GenericLogo className={className} initials="CO" />;
  // Other Acme variants: their own initials.
  if (clientId.startsWith("acme")) return <GenericLogo className={className} initials={CLIENTS[clientId]?.company.initials ?? "AG"} />;
  return clientId === "wooga" ? <WoogaLogo className={className} /> : <ProductMadnessLogo className={className} />;
}

/** Appcharge shorthand "a" mark — monochrome, inherits text color. Size via className. */
export function ShorthandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 166 171" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M82.9817 169.759C34.7113 169.759 0 132.768 0 84.7051C0 36.6423 34.7113 0 82.9817 0C131.252 0 165.963 36.6423 165.963 84.7051C165.963 85.3118 165.963 85.9185 165.948 86.5251V162.949C165.948 164.163 164.969 165.133 163.779 165.133H126.823C125.618 165.133 124.653 164.148 124.653 162.949V84.1743C124.427 57.1324 106.981 38.0224 82.9967 38.0224C59.0122 38.0224 41.3402 57.3902 41.3402 84.7051C41.3402 112.02 58.8615 131.388 82.9967 131.388C90.9966 131.388 98.2733 129.295 104.42 125.503C105.866 124.608 107.735 125.624 107.735 127.338V164.602C107.735 165.588 107.087 166.468 106.138 166.726C98.8759 168.697 91.1322 169.744 83.0118 169.744L82.9817 169.759Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Appcharge brand mark (self-contained, colored). Size it via className. */
export function AppchargeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 410 410" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path
        d="M204.512 281.19C160.246 281.19 128.414 247.493 128.414 203.71C128.414 159.928 160.246 126.548 204.512 126.548C248.778 126.548 280.61 159.928 280.61 203.71C280.61 204.263 280.61 204.815 280.596 205.368V274.986C280.596 276.092 279.698 276.976 278.607 276.976H244.716C243.611 276.976 242.727 276.078 242.727 274.986V203.227C242.52 178.593 226.521 161.185 204.526 161.185C182.531 161.185 166.325 178.828 166.325 203.71C166.325 228.593 182.393 246.235 204.526 246.235C211.862 246.235 218.535 244.329 224.172 240.875C225.499 240.06 227.212 240.985 227.212 242.547V276.492C227.212 277.39 226.618 278.192 225.747 278.426C219.088 280.223 211.987 281.176 204.54 281.176L204.512 281.19Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="white"
      />
      <rect x="24.9897" y="5.74841" width="383.177" height="383.178" rx="191.589" fill="#A033E8" />
      <rect x="5.83142" width="383.177" height="383.178" rx="191.589" fill="#6CCD3F" />
      <rect x="7.75171" y="26.8221" width="383.177" height="383.178" rx="191.589" fill="#FE7558" />
      <rect x="2" y="7.66345" width="383.177" height="383.178" rx="191.589" fill="#338DE8" />
      <rect x="9.66602" y="17.2437" width="383.177" height="383.178" rx="191.589" fill="#F7CE46" />
      <rect x="13.4929" y="13.4102" width="379.346" height="379.346" rx="189.673" fill="#5FE5D9" />
      <rect x="15.0735" y="20.8347" width="368.225" height="368.236" rx="184.113" fill="#272727" />
      <path
        d="M199.939 290.31C151.669 290.31 116.957 253.318 116.957 205.256C116.957 157.193 151.669 120.55 199.939 120.55C248.209 120.55 282.921 157.193 282.921 205.256C282.921 205.862 282.921 206.469 282.906 207.076V283.5C282.906 284.713 281.926 285.684 280.736 285.684H243.78C242.575 285.684 241.611 284.698 241.611 283.5V204.725C241.385 177.683 223.939 158.573 199.954 158.573C175.97 158.573 158.298 177.941 158.298 205.256C158.298 232.57 175.819 251.938 199.954 251.938C207.954 251.938 215.231 249.845 221.377 246.054C222.824 245.159 224.692 246.175 224.692 247.889V285.153C224.692 286.139 224.044 287.018 223.095 287.276C215.833 289.248 208.09 290.294 199.969 290.294L199.939 290.31Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="white"
      />
    </svg>
  );
}
