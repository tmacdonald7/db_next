import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCallbackPanel } from "@/app/members/callback/AuthCallbackPanel";

export const metadata: Metadata = {
  title: "Completing Sign In",
  description: "Finalizing member authentication for the internal song board.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MembersCallbackPage() {
  return (
    <div className="container">
      <section className="page-header members-sign-in-header">
        <h1>Completing Sign In</h1>
        <p>We are finishing your secure member sign-in and sending you to the songs board.</p>
      </section>

      <Suspense fallback={null}>
        <AuthCallbackPanel />
      </Suspense>
    </div>
  );
}
