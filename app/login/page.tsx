import type { Metadata } from "next";
import { SignIn } from "@/components/auth/sign-in";

export const metadata: Metadata = { title: "Sign in · Appcharge" };

/** Sign in (/login): outside the dashboard, so no navigation around it. */
export default function LoginPage() {
  return <SignIn />;
}
