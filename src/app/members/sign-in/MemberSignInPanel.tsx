"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeEmail, normalizePhoneNumber } from "@/lib/member-auth";
import {
  createSupabaseBrowserClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase";

type LookupMember = {
  displayName: string;
  instrument: string;
  hasEmail: boolean;
  hasPhone: boolean;
  isAdmin: boolean;
};

type LookupResponse = {
  member: LookupMember;
};

export function MemberSignInPanel() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const [hasPublicConfig, setHasPublicConfig] = useState(true);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [matchedMember, setMatchedMember] = useState<LookupMember | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"phone" | "verify" | "email" | "google" | null>(null);

  useEffect(() => {
    setHasPublicConfig(hasSupabasePublicConfig());
    setSupabase(createSupabaseBrowserClient());
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) {
        router.replace("/songs");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace("/songs");
        router.refresh();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  async function lookupMember(payload: { phone?: string; email?: string }) {
    const response = await fetch("/api/member-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as LookupResponse | { error?: string };

    if (!response.ok || !("member" in result)) {
      throw new Error(
        "error" in result && result.error
          ? result.error
          : "Unable to verify member access.",
      );
    }

    return result.member;
  }

  async function handlePhoneSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }

    const client = supabase;
    setBusyAction("phone");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const normalizedPhone = normalizePhoneNumber(phone);

      if (!normalizedPhone) {
        throw new Error("Enter a valid phone number.");
      }

      const member = await lookupMember({ phone: normalizedPhone });
      const { error } = await client.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          channel: "sms",
        },
      });

      if (error) {
        throw error;
      }

      setPendingPhone(normalizedPhone);
      setMatchedMember(member);
      setStatusMessage(`Text sent to ${member.displayName}. Enter the code to finish signing in.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send text code.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handlePhoneVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }
    const client = supabase;

    if (!pendingPhone) {
      setErrorMessage("Request a text code first.");
      return;
    }

    setBusyAction("verify");
    setErrorMessage(null);

    try {
      const { error } = await client.auth.verifyOtp({
        phone: pendingPhone,
        token: otpCode,
        type: "sms",
      });

      if (error) {
        throw error;
      }

      router.replace("/songs");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to verify the text code.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleEmailSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      return;
    }
    const client = supabase;
    setBusyAction("email");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Enter a valid email address.");
      }

      const member = await lookupMember({ email: normalizedEmail });
      const { error } = await client.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/songs`,
        },
      });

      if (error) {
        throw error;
      }

      setMatchedMember(member);
      setStatusMessage(`Magic link sent to ${normalizedEmail}. Open it on this device to continue.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to send magic link.");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleGoogleSignIn() {
    if (!supabase) {
      return;
    }
    const client = supabase;
    setBusyAction("google");
    setErrorMessage(null);
    setStatusMessage("Redirecting to Google sign in...");

    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/songs`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to start Google sign in.");
      setStatusMessage(null);
      setBusyAction(null);
    }
  }

  if (!hasPublicConfig) {
    return (
      <section className="section">
        <article className="panel members-auth-notes">
          <div className="section-heading">
            <h2>Member Auth Needs Setup</h2>
          </div>
          <p className="members-auth-copy">
            This deploy is missing the public Supabase environment variables, so the
            sign-in tools cannot load yet.
          </p>
          <ul className="song-list members-notes-list">
            <li>Add `NEXT_PUBLIC_SUPABASE_URL` in Netlify.</li>
            <li>Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify.</li>
            <li>Redeploy the site after saving those values.</li>
          </ul>
        </article>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="grid members-sign-in-grid">
        <article className="panel members-auth-card">
          <div className="section-heading">
            <h2>Phone Sign In</h2>
          </div>
          <p className="members-auth-copy">
            Use the phone number on file and we will send a one-time text code.
          </p>
          <form className="members-auth-form" onSubmit={handlePhoneSignIn}>
            <label>
              Mobile number
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(936) 283-1476"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button-primary"
              disabled={busyAction === "phone"}
            >
              {busyAction === "phone" ? "Sending Text..." : "Text Me a Code"}
            </button>
          </form>

          {pendingPhone ? (
            <form className="members-auth-form members-auth-verify" onSubmit={handlePhoneVerify}>
              <label>
                Text code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(event) => setOtpCode(event.target.value)}
                />
              </label>
              <button
                type="submit"
                className="button-secondary"
                disabled={busyAction === "verify"}
              >
                {busyAction === "verify" ? "Verifying..." : "Complete Sign In"}
              </button>
            </form>
          ) : null}
        </article>

        <article className="panel members-auth-card">
          <div className="section-heading">
            <h2>Email Or Google</h2>
          </div>
          <p className="members-auth-copy">
            Email magic links and Google sign-in work too. Access still depends on
            the email matching an approved band-member record in Supabase.
          </p>
          <form className="members-auth-form" onSubmit={handleEmailSignIn}>
            <label>
              Email address
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="member@band.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button-secondary"
              disabled={busyAction === "email"}
            >
              {busyAction === "email" ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          <button
            type="button"
            className="button-secondary members-google-button"
            onClick={handleGoogleSignIn}
            disabled={busyAction === "google"}
          >
            {busyAction === "google" ? "Redirecting..." : "Continue With Google"}
          </button>
        </article>
      </div>

      <article className="panel members-auth-notes">
        <div className="section-heading">
          <h2>Band Access Notes</h2>
        </div>
        <ul className="song-list members-notes-list">
          <li>Phone sign-in works best once Supabase phone auth and your SMS provider are enabled.</li>
          <li>Email sign-in currently only works for members whose email address is already on file.</li>
          <li>Google sign-in is ready once Google OAuth is configured in Supabase Auth.</li>
          <li>After sign-in, the internal songs board stays private and is set to `noindex`.</li>
        </ul>

        {matchedMember ? (
          <p className="status success">
            Approved member: {matchedMember.displayName} • {matchedMember.instrument}
          </p>
        ) : null}
        {statusMessage ? <p className="status success">{statusMessage}</p> : null}
        {errorMessage ? <p className="status error">{errorMessage}</p> : null}
      </article>
    </section>
  );
}
