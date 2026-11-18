import type { Metadata } from "next";
import { SignUp } from "@/components/auth/sign-in";

export const metadata: Metadata = { title: "Sign up · Appcharge" };

/** Sign up (/signup): the same page as sign in, creating an account; it continues to organization onboarding. */
export default function SignUpPage() {
  return <SignUp />;
}
