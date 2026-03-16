"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getMemberAvatarLabel } from "@/lib/member-display";

type SessionUser = {
  email?: string | null;
  phone?: string | null;
  userMetadata?: {
    avatar_url?: string | null;
    full_name?: string | null;
    name?: string | null;
  };
};

type BandMember = {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  avatar_label: string | null;
  avatar_theme: "default" | "investor";
  is_admin: boolean;
};

export function MemberNavStatus() {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [bandMember, setBandMember] = useState<BandMember | null>(null);

  useEffect(() => {
    setSupabase(createSupabaseBrowserClient());
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }

      const user = data.session?.user;
      setSessionUser(
        user
          ? {
              email: user.email,
              phone: user.phone,
              userMetadata: {
                avatar_url:
                  typeof user.user_metadata.avatar_url === "string"
                    ? user.user_metadata.avatar_url
                    : null,
                full_name:
                  typeof user.user_metadata.full_name === "string"
                    ? user.user_metadata.full_name
                    : null,
                name:
                  typeof user.user_metadata.name === "string"
                    ? user.user_metadata.name
                    : null,
              },
            }
          : null,
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setSessionUser(
        user
          ? {
              email: user.email,
              phone: user.phone,
              userMetadata: {
                avatar_url:
                  typeof user.user_metadata.avatar_url === "string"
                    ? user.user_metadata.avatar_url
                    : null,
                full_name:
                  typeof user.user_metadata.full_name === "string"
                    ? user.user_metadata.full_name
                    : null,
                name:
                  typeof user.user_metadata.name === "string"
                    ? user.user_metadata.name
                    : null,
              },
            }
          : null,
      );
      setBandMember(null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !sessionUser?.email) {
      setBandMember(null);
      return;
    }

    let active = true;

    supabase
      .from("band_members")
      .select("id, display_name, email, avatar_url, avatar_label, avatar_theme, is_admin")
      .eq("email", sessionUser.email.toLowerCase())
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active || error) {
          setBandMember(null);
          return;
        }

        setBandMember(data);
      });

    return () => {
      active = false;
    };
  }, [sessionUser?.email, supabase]);

  const label = useMemo(() => {
    if (bandMember?.display_name) {
      return bandMember.display_name;
    }

    return (
      sessionUser?.userMetadata?.full_name ??
      sessionUser?.userMetadata?.name ??
      sessionUser?.email ??
      "Member"
    );
  }, [bandMember?.display_name, sessionUser?.email, sessionUser?.userMetadata]);

  const avatarImage = bandMember?.avatar_url ?? sessionUser?.userMetadata?.avatar_url ?? null;
  const badgeText = bandMember?.is_admin ? "Admin" : sessionUser ? "Signed In" : null;
  const avatarLabel = bandMember ? getMemberAvatarLabel(bandMember) : label.slice(0, 2).toUpperCase();

  if (!sessionUser) {
    return (
      <Link href="/members/sign-in" className="members-nav-button">
        Sign In
      </Link>
    );
  }

  return (
    <div className="member-nav-shell">
      <Link href="/songs" className="member-nav-badge" aria-label="Open member songs board">
        <span
          className={`member-nav-avatar${bandMember?.avatar_theme === "investor" ? " member-nav-avatar-investor" : ""}`}
        >
          {avatarImage ? (
            <img src={avatarImage} alt={label} />
          ) : (
            <span>{avatarLabel}</span>
          )}
        </span>
        <span className="member-nav-copy">
          <span className="member-nav-label">{label}</span>
          {badgeText ? <span className="member-nav-meta">{badgeText}</span> : null}
        </span>
      </Link>
      <button
        type="button"
        className="member-nav-signout"
        onClick={() => {
          if (supabase) {
            void supabase.auth.signOut();
          }
          setSessionUser(null);
          setBandMember(null);
        }}
      >
        Sign Out
      </button>
    </div>
  );
}
