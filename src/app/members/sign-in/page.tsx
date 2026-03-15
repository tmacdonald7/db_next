import type { Metadata } from "next";
import { MemberSignInPanel } from "@/app/members/sign-in/MemberSignInPanel";

export const metadata: Metadata = {
  title: "Members Sign In",
  description: "Band-member sign in for The Feedback Committee internal repertoire board.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MembersSignInPage() {
  return (
    <div className="container">
      <section className="page-header members-sign-in-header">
        <h1>Members Sign In</h1>
        <p>
          Sign in with your email magic link or Google account to access the
          internal song board and update your confidence on the current set.
        </p>
      </section>

      <MemberSignInPanel />
    </div>
  );
}
