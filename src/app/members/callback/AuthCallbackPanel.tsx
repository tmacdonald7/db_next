"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export function AuthCallbackPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Finishing sign-in...");

  useEffect(() => {
    const browserClient = createSupabaseBrowserClient();

    if (!browserClient) {
      setMessage("Supabase is not configured on this deploy.");
      return;
    }

    const client = browserClient;

    let active = true;

    async function finishSignIn() {
      const code = searchParams.get("code");
      const authError = searchParams.get("error_description") ?? searchParams.get("error");

      if (authError) {
        throw new Error(authError);
      }

      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);

        if (error) {
          throw error;
        }
      }

      const { data, error } = await client.auth.getSession();

      if (error) {
        throw error;
      }

      if (!data.session) {
        throw new Error("No member session was created. Please try signing in again.");
      }

      if (active) {
        router.replace("/songs");
        router.refresh();
      }
    }

    void finishSignIn().catch((error) => {
      if (!active) {
        return;
      }

      setMessage(error instanceof Error ? error.message : "Unable to finish sign-in.");
    });

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  return (
    <section className="section">
      <article className="panel members-auth-notes">
        <div className="section-heading">
          <h2>Finishing Sign-In</h2>
        </div>
        <p className="members-auth-copy">{message}</p>
      </article>
    </section>
  );
}
