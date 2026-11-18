/**
 * Usability test: the Appcharge team's avatars (from the test session's invite list), so a participant who types their
 * own name on the intro sees their own picture as the signed-in user. Photos live in public/avatars/team; people with
 * no photo get their initials on their own colour (as in Google Calendar), and Roey the default person icon.
 */
export type TeamAvatar = { src?: string; initials?: string; color?: string; person?: boolean };

type Member = { first: string; last?: string } & TeamAvatar;

const photo = (slug: string) => `/avatars/team/${slug}.png`;

const TEAM: Member[] = [
  { first: "fanny", last: "beili", src: photo("fanny-beili") },
  { first: "aviram", last: "ben shushan", initials: "A", color: "#1e4c41" },
  { first: "jonathan", src: photo("jonathan") },
  { first: "noam", last: "sachartov", src: photo("noam-sachartov") },
  { first: "or", last: "porat", initials: "Or", color: "#b22d5b" },
  { first: "roei", last: "barassi", src: photo("roei-barassi") },
  { first: "roey", last: "barkan", person: true, color: "#a7c2fa" },
  { first: "rony", src: photo("rony") },
  { first: "naama", last: "weisal", src: photo("naama-weisal") },
  { first: "oz", last: "giat", initials: "Oz", color: "#7d8f9b" },
  { first: "daniel", last: "peiro conde", initials: "D", color: "#da4f7a" },
  { first: "oran", last: "stern", initials: "O", color: "#7859bc" },
  { first: "amit", last: "porat", src: photo("amit-porat") },
  { first: "elad", last: "nahor", src: photo("elad-nahor") },
  { first: "gil", last: "tov ly", src: photo("gil-tov-ly") },
  { first: "gili", last: "avneri", src: photo("gili-avneri") },
  { first: "maor", last: "sason", src: photo("maor-sason") },
  // From the test session's later invite list (photos cropped from it).
  { first: "roy", last: "gil", src: photo("roy-gil") },
  { first: "nitzan", last: "paz", src: photo("nitzan-paz") },
  { first: "shelly", last: "halachmi", src: photo("shelly-halachmi") },
  { first: "yoav", last: "gross", src: photo("yoav-gross") },
  { first: "peleg", last: "nachum", initials: "P", color: "#7d8a91" },
  { first: "raz", last: "leshem", person: true, color: "#a7c2fa" },
  { first: "oded", last: "roesler", initials: "O", color: "#da4f7a" },
  { first: "michal", last: "ronen", initials: "M", color: "#e8572b" },
  { first: "daniela", last: "eydel shema", initials: "D", color: "#e25b2c" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();

/**
 * The team member a typed name belongs to: the first name must match exactly; a last name, when typed, must match the
 * start of theirs ("Or Porat", "or", "Amit P" all work; "Or" never matches "Oran"). Null for anyone else.
 */
export function teamAvatar(name: string | null | undefined): TeamAvatar | null {
  const [first, ...rest] = norm(name ?? "").split(" ");
  if (!first) return null;
  const last = rest.join(" ");
  const hits = TEAM.filter((m) => m.first === first && (!last || (m.last ?? "").startsWith(last)));
  // A first name shared by two people (none today) without a last name stays ambiguous: no picture.
  return hits.length === 1 ? hits[0] : null;
}
