import { redirect } from "next/navigation";
import { companyHref, DEFAULT_CLIENT_ID, DEFAULT_SECTION } from "@/lib/newgen";

/** Usability test: entering the dashboard lands on the new company's Home, with nothing below it yet. */
export default function DashboardIndex() {
  redirect(companyHref(DEFAULT_CLIENT_ID, DEFAULT_SECTION));
}
