import { redirect } from "next/navigation";

/** Test 2: no intro page. The app opens straight on the empty company dashboard (where the intro's Start used to go). */
export default function Home() {
  redirect("/dashboard/company/home?client=acme-ft-empty");
}
