"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  createSupabaseBrowserClient,
  hasSupabasePublicConfig,
} from "@/lib/supabase";
import {
  defaultSongCatalog,
  getSongSlug,
  songConfidenceLabels,
  type SongConfidence,
  type SongStage,
} from "@/lib/songs";
import {
  canViewerSeeMemberAvatar,
  getMemberAvatarLabel,
} from "@/lib/member-display";

type SessionUser = {
  email?: string | null;
  phone?: string | null;
};

type BandMember = {
  id: string;
  display_name: string;
  instrument: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  avatar_label: string | null;
  avatar_theme: "default" | "investor";
  is_admin: boolean;
  can_vote: boolean;
  counts_toward_votes: boolean;
  is_hidden_from_band: boolean;
};

type SongRecord = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  status: SongStage;
  sort_order: number;
  suggested_by_member_id: string | null;
  notes: string | null;
};

type SongMemberStatus = {
  song_id: string;
  member_id: string;
  confidence: SongConfidence;
};

type SongSuggestionVote = {
  song_id: string;
  member_id: string;
};

type SongBucket = "active" | "suggested" | "archived";
type DropIndicator = {
  songId: string;
  bucket: SongBucket;
  position: "before" | "after";
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

function matchesCurrentMember(member: BandMember, user: SessionUser | null) {
  if (!user) {
    return false;
  }

  const userEmail = user.email?.toLowerCase() ?? null;
  const memberEmail = member.email?.toLowerCase() ?? null;

  return (
    (userEmail && memberEmail && userEmail === memberEmail) ||
    (user.phone && member.phone && user.phone === member.phone)
  );
}

function getSongBucket(song: SongRecord): SongBucket {
  if (song.status === "suggested") {
    return "suggested";
  }
  if (song.status === "archived") {
    return "archived";
  }
  return "active";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

type SongNotesMetadata = {
  setNumber?: number;
};

function parseSongNotesMetadata(notes: string | null): SongNotesMetadata {
  if (!notes) {
    return {};
  }

  try {
    const parsed = JSON.parse(notes) as SongNotesMetadata;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function getSongSetNumber(song: SongRecord) {
  const parsed = parseSongNotesMetadata(song.notes);
  const setNumber = parsed.setNumber;

  if (typeof setNumber === "number" && Number.isFinite(setNumber)) {
    return Math.min(4, Math.max(1, Math.round(setNumber)));
  }

  return Math.min(4, Math.max(1, Math.floor(song.sort_order / 10) + 1));
}

function withSongSetNumber(song: SongRecord, setNumber: number) {
  const nextNotes = {
    ...parseSongNotesMetadata(song.notes),
    setNumber: Math.min(4, Math.max(1, Math.round(setNumber))),
  };

  return JSON.stringify(nextNotes);
}

export function SongsBoard() {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const [hasPublicConfig, setHasPublicConfig] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [members, setMembers] = useState<BandMember[]>([]);
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [statuses, setStatuses] = useState<SongMemberStatus[]>([]);
  const [suggestionVotes, setSuggestionVotes] = useState<SongSuggestionVote[]>([]);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionArtist, setSuggestionArtist] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [dragSongId, setDragSongId] = useState<string | null>(null);
  const [dragBucket, setDragBucket] = useState<SongBucket | null>(null);
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [impersonatedMemberId, setImpersonatedMemberId] = useState<string | null>(null);

  useEffect(() => {
    setHasPublicConfig(hasSupabasePublicConfig());
    setSupabase(createSupabaseBrowserClient());
    if (typeof window !== "undefined") {
      setImpersonatedMemberId(window.localStorage.getItem("songs-board-impersonation-member-id"));
    }
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

      const user = data.session?.user ?? null;
      setSessionUser(
        user
          ? {
              email: user.email,
              phone: user.phone,
            }
          : null,
      );
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setSessionUser(
        user
          ? {
              email: user.email,
              phone: user.phone,
            }
          : null,
      );
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function loadBoard() {
    if (!supabase) {
      return;
    }

    const client = supabase;
    setLoading(true);
    setErrorMessage(null);

    try {
      const [membersResult, songsResult, statusesResult, votesResult] = await Promise.all([
        client
          .from("band_members")
          .select(
            "id, display_name, instrument, email, phone, avatar_url, avatar_label, avatar_theme, is_admin, can_vote, counts_toward_votes, is_hidden_from_band",
          )
          .order("created_at", { ascending: true }),
        client
          .from("songs")
          .select("id, slug, title, artist, status, sort_order, suggested_by_member_id, notes")
          .order("status", { ascending: true })
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        client.from("song_member_statuses").select("song_id, member_id, confidence"),
        client.from("song_suggestion_votes").select("song_id, member_id"),
      ]);

      if (membersResult.error) {
        throw membersResult.error;
      }
      if (songsResult.error) {
        throw songsResult.error;
      }
      if (statusesResult.error) {
        throw statusesResult.error;
      }
      if (votesResult.error) {
        throw votesResult.error;
      }

      setMembers(membersResult.data ?? []);
      setSongs(songsResult.data ?? []);
      setStatuses(statusesResult.data ?? []);
      setSuggestionVotes(votesResult.data ?? []);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to load the songs board right now."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionUser) {
      setMembers([]);
      setSongs([]);
      setStatuses([]);
      setSuggestionVotes([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      return;
    }

    void loadBoard();
  }, [sessionUser, supabase]);

  const actualMember = useMemo(
    () => members.find((member) => matchesCurrentMember(member, sessionUser)) ?? null,
    [members, sessionUser],
  );
  const currentMember = useMemo(() => {
    if (!impersonatedMemberId) {
      return actualMember;
    }

    return members.find((member) => member.id === impersonatedMemberId) ?? actualMember;
  }, [actualMember, impersonatedMemberId, members]);
  const isImpersonating =
    Boolean(impersonatedMemberId) &&
    Boolean(actualMember) &&
    currentMember?.id !== actualMember?.id;
  const canSeePrivateMembers = Boolean(actualMember?.is_admin) && !isImpersonating;
  const visibleVotingMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          member.can_vote &&
          canViewerSeeMemberAvatar(member, currentMember?.id ?? null, canSeePrivateMembers),
      ),
    [canSeePrivateMembers, currentMember?.id, members],
  );
  const countedVotingMemberIds = useMemo(
    () =>
      new Set(
        members
          .filter((member) => member.can_vote && member.counts_toward_votes)
          .map((member) => member.id),
      ),
    [members],
  );
  const countedVotingMemberCount = countedVotingMemberIds.size;

  useEffect(() => {
    if (!actualMember?.is_admin) {
      setImpersonatedMemberId(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("songs-board-impersonation-member-id");
      }
      return;
    }

    if (impersonatedMemberId && !members.some((member) => member.id === impersonatedMemberId)) {
      setImpersonatedMemberId(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("songs-board-impersonation-member-id");
      }
    }
  }, [actualMember?.is_admin, impersonatedMemberId, members]);

  const songStatusMap = useMemo(() => {
    const map = new Map<string, Map<string, SongConfidence>>();

    for (const status of statuses) {
      const songMap = map.get(status.song_id) ?? new Map<string, SongConfidence>();
      songMap.set(status.member_id, status.confidence);
      map.set(status.song_id, songMap);
    }

    return map;
  }, [statuses]);

  const visibleSuggestionVoteCountMap = useMemo(() => {
    const map = new Map<string, number>();
    const visibleMemberIds = new Set(visibleVotingMembers.map((member) => member.id));

    for (const vote of suggestionVotes) {
      if (!visibleMemberIds.has(vote.member_id)) {
        continue;
      }

      map.set(vote.song_id, (map.get(vote.song_id) ?? 0) + 1);
    }

    return map;
  }, [suggestionVotes, visibleVotingMembers]);
  const countedSuggestionVoteCountMap = useMemo(() => {
    const map = new Map<string, number>();

    for (const vote of suggestionVotes) {
      if (!countedVotingMemberIds.has(vote.member_id)) {
        continue;
      }

      map.set(vote.song_id, (map.get(vote.song_id) ?? 0) + 1);
    }

    return map;
  }, [countedVotingMemberIds, suggestionVotes]);

  const currentMemberVoteSet = useMemo(() => {
    if (!currentMember) {
      return new Set<string>();
    }

    return new Set(
      suggestionVotes
        .filter((vote) => vote.member_id === currentMember.id)
        .map((vote) => vote.song_id),
    );
  }, [currentMember, suggestionVotes]);

  const activeSongs = songs
    .filter((song) => song.status === "active" || song.status === "selected")
    .sort(
      (left, right) =>
        getSongSetNumber(left) - getSongSetNumber(right) ||
        left.sort_order - right.sort_order,
    );
  const suggestedSongs = songs
    .filter((song) => song.status === "suggested")
    .sort(
      (left, right) =>
        left.title.localeCompare(right.title) ||
        left.artist.localeCompare(right.artist),
    );
  const archivedSongs = songs
    .filter((song) => song.status === "archived")
    .sort((left, right) => left.sort_order - right.sort_order);
  const activeSets = Array.from({ length: 4 }, (_value, index) => ({
    label: `Set ${index + 1}`,
    setNumber: index + 1,
    songs: activeSongs.filter((song) => getSongSetNumber(song) === index + 1),
  }));
  const defaultActiveSetNumber =
    activeSets.findLast((setGroup) => setGroup.songs.length > 0)?.setNumber ?? 1;

  function openPrintExport(title: string, bodyMarkup: string) {
    if (typeof window === "undefined") {
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setErrorMessage("Unable to open the PDF export window. Please allow pop-ups and try again.");
      return;
    }

    const exportedAt = new Date().toLocaleString();
    const documentTitle = escapeHtml(title);

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${documentTitle}</title>
    <style>
      :root {
        color-scheme: light;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 32px;
        color: #16181d;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        background: #ffffff;
      }
      main {
        max-width: 860px;
        margin: 0 auto;
      }
      .export-header {
        margin-bottom: 28px;
        padding-bottom: 18px;
        border-bottom: 2px solid #d4a373;
      }
      .export-kicker {
        margin: 0 0 8px;
        color: #8f3d0a;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .export-meta {
        margin: 10px 0 0;
        color: #4f5963;
        font-size: 13px;
      }
      .export-section {
        margin-top: 22px;
        break-inside: avoid;
      }
      .export-section h2 {
        margin: 0 0 10px;
        font-size: 18px;
        line-height: 1.1;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      ol,
      ul {
        margin: 0;
        padding-left: 24px;
      }
      li {
        margin: 0 0 6px;
        padding-left: 6px;
        font-size: 15px;
        line-height: 1.45;
      }
      .artist {
        color: #5a6570;
      }
      @media print {
        body {
          padding: 18px;
        }
      }
    </style>
    <script>
      window.addEventListener("load", () => {
        window.setTimeout(() => {
          window.focus();
          window.print();
        }, 180);
      });
    </script>
  </head>
  <body>
    <main>
      <header class="export-header">
        <p class="export-kicker">The Feedback Committee</p>
        <h1>${documentTitle}</h1>
        <p class="export-meta">Exported ${escapeHtml(exportedAt)}</p>
      </header>
      ${bodyMarkup}
    </main>
  </body>
</html>`);
    printWindow.document.close();
  }

  function exportActiveSetList() {
    const sections = activeSets
      .map((setGroup) => {
        const items =
          setGroup.songs.length > 0
            ? setGroup.songs
                .map(
                  (song) =>
                    `<li><strong>${escapeHtml(song.title)}</strong> <span class="artist">${escapeHtml(song.artist)}</span></li>`,
                )
                .join("")
            : "<li>No songs in this set yet.</li>";

        return `<section class="export-section"><h2>${escapeHtml(setGroup.label)}</h2><ol>${items}</ol></section>`;
      })
      .join("");

    openPrintExport("Active Set List", sections);
  }

  function exportSuggestedSongs() {
    const items =
      suggestedSongs.length > 0
        ? suggestedSongs
            .map(
              (song) =>
                `<li><strong>${escapeHtml(song.title)}</strong> <span class="artist">${escapeHtml(song.artist)}</span>${visibleSuggestionVoteCountMap.get(song.id) ? ` <span class="artist">(${visibleSuggestionVoteCountMap.get(song.id)} votes)</span>` : ""}</li>`,
            )
            .join("")
        : "<li>No suggested songs right now.</li>";

    openPrintExport(
      "Suggested Songs",
      `<section class="export-section"><h2>Suggested Songs</h2><ul>${items}</ul></section>`,
    );
  }

  async function runImpersonatedAction(
    payload:
      | { action: "toggle_vote"; songId: string }
      | { action: "update_confidence"; songId: string; confidence: SongConfidence }
      | { action: "suggest_song"; title: string; artist: string },
  ) {
    if (!supabase || !actualMember?.is_admin || !currentMember) {
      throw new Error("Admin impersonation is not available right now.");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error("Missing member session. Please sign in again.");
    }

    const response = await fetch("/api/member-impersonation", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        ...payload,
        memberId: currentMember.id,
      }),
    });

    const result = (await response.json()) as { error?: string; statusMessage?: string };

    if (!response.ok) {
      throw new Error(result.error ?? "Unable to complete the impersonated action.");
    }

    await loadBoard();
    setStatusMessage(result.statusMessage ?? `Updated as ${currentMember.display_name}.`);
  }

  async function toggleSuggestionVote(song: SongRecord) {
    if (!currentMember || !supabase) {
      return;
    }

    if (!currentMember.can_vote) {
      setErrorMessage("This member account can suggest songs, but voting is disabled.");
      setStatusMessage(null);
      return;
    }

    const client = supabase;
    const songId = song.id;
    const explicitVoteCount = countedSuggestionVoteCountMap.get(songId) ?? 0;
    const implicitActiveApproval =
      currentMember.counts_toward_votes &&
      (song.status === "active" || song.status === "selected") &&
      explicitVoteCount < countedVotingMemberCount &&
      countedVotingMemberCount > 0;
    const hasVoted = implicitActiveApproval || currentMemberVoteSet.has(songId);

    setBusyKey(`vote:${songId}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (isImpersonating) {
        await runImpersonatedAction({
          action: "toggle_vote",
          songId,
        });
        return;
      }

      if (hasVoted) {
        const { error } = await client
          .from("song_suggestion_votes")
          .delete()
          .eq("song_id", songId)
          .eq("member_id", currentMember.id);

        if (error) {
          throw error;
        }

        let nextVotes = suggestionVotes.filter(
          (vote) => !(vote.song_id === songId && vote.member_id === currentMember.id),
        );

        if (implicitActiveApproval) {
          const existingMemberIds = new Set(
            nextVotes.filter((vote) => vote.song_id === songId).map((vote) => vote.member_id),
          );

          nextVotes = [
            ...nextVotes,
            ...members
              .filter(
                (member) =>
                  member.can_vote &&
                  member.counts_toward_votes &&
                  member.id !== currentMember.id &&
                  !existingMemberIds.has(member.id),
              )
              .map((member) => ({
                song_id: songId,
                member_id: member.id,
              })),
          ];
        }

        const nextVoteCount = nextVotes.filter(
          (vote) => vote.song_id === songId && countedVotingMemberIds.has(vote.member_id),
        ).length;
        const approvedMemberCount = countedVotingMemberCount;

        if (
          (song.status === "active" || song.status === "selected") &&
          approvedMemberCount > 0 &&
          nextVoteCount < approvedMemberCount
        ) {
          const { error: stageError } = await client
            .from("songs")
            .update({
              status: "suggested",
              sort_order: suggestedSongs.length,
            })
            .eq("id", songId);

          if (stageError) {
            throw stageError;
          }

          setSuggestionVotes(nextVotes);
          setSongs((current) =>
            current.map((entry) =>
              entry.id === songId
                ? {
                    ...entry,
                    status: "suggested",
                    sort_order: suggestedSongs.length,
                  }
                : entry,
            ),
          );
          setStatusMessage("Song moved back to suggested songs.");
        } else {
          setSuggestionVotes(nextVotes);
          setStatusMessage("Vote removed.");
        }
      } else {
        const { data, error } = await client
          .from("song_suggestion_votes")
          .insert({
            song_id: songId,
            member_id: currentMember.id,
          })
          .select("song_id, member_id")
          .single();

        if (error) {
          throw error;
        }

        const nextVotes = [...suggestionVotes, data];
        const nextVoteCount = nextVotes.filter(
          (vote) => vote.song_id === songId && countedVotingMemberIds.has(vote.member_id),
        ).length;
        const approvedMemberCount = countedVotingMemberCount;

        if (approvedMemberCount > 0 && nextVoteCount >= approvedMemberCount) {
          const nextNotes = withSongSetNumber(song, defaultActiveSetNumber);
          const { error: stageError } = await client
            .from("songs")
            .update({
              status: "active",
              sort_order: activeSongs.length,
              notes: nextNotes,
            })
            .eq("id", songId);

          if (stageError) {
            throw stageError;
          }

          setSuggestionVotes(nextVotes);
          setSongs((current) =>
            current.map((song) =>
              song.id === songId
                ? {
                    ...song,
                    status: "active",
                    sort_order: activeSongs.length,
                    notes: nextNotes,
                  }
                : song,
            ),
          );
          setStatusMessage("Song moved to the active set list.");
        } else {
          setSuggestionVotes(nextVotes);
          setStatusMessage("Vote added.");
        }
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to update song vote."));
    } finally {
      setBusyKey(null);
    }
  }

  async function updateConfidence(songId: string, confidence: SongConfidence) {
    if (!currentMember || !supabase) {
      return;
    }

    const client = supabase;
    setBusyKey(`confidence:${songId}:${confidence}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (isImpersonating) {
        await runImpersonatedAction({
          action: "update_confidence",
          songId,
          confidence,
        });
        return;
      }

      const { error } = await client.from("song_member_statuses").upsert(
        {
          song_id: songId,
          member_id: currentMember.id,
          confidence,
        },
        {
          onConflict: "song_id,member_id",
        },
      );

      if (error) {
        throw error;
      }

      setStatuses((current) => {
        const next = current.filter(
          (status) =>
            !(status.song_id === songId && status.member_id === currentMember.id),
        );
        next.push({
          song_id: songId,
          member_id: currentMember.id,
          confidence,
        });
        return next;
      });
      setStatusMessage("Confidence updated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to update confidence."));
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentMember || !supabase) {
      return;
    }

    const client = supabase;
    const title = suggestionTitle.trim();
    const artist = suggestionArtist.trim();

    if (!title || !artist) {
      setErrorMessage("Add both a song title and an artist.");
      return;
    }

    setBusyKey("suggestion:create");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (isImpersonating) {
        await runImpersonatedAction({
          action: "suggest_song",
          title,
          artist,
        });
        setSuggestionTitle("");
        setSuggestionArtist("");
        return;
      }

      const slug = getSongSlug(title, artist);
      const { data, error } = await client
        .from("songs")
        .insert({
          slug,
          title,
          artist,
          status: "suggested",
          sort_order: suggestedSongs.length,
          suggested_by_member_id: currentMember.id,
        })
        .select("id, slug, title, artist, status, sort_order, suggested_by_member_id, notes")
        .single();

      if (error) {
        throw error;
      }

      setSongs((current) => [...current, data]);
      setSuggestionTitle("");
      setSuggestionArtist("");
      setStatusMessage("Suggested song added.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to add the suggested song."));
    } finally {
      setBusyKey(null);
    }
  }

  async function updateSongStage(songId: string, status: SongStage) {
    if (!supabase) {
      return;
    }

    const client = supabase;
    const nextBucket = status === "suggested" ? suggestedSongs : activeSongs;
    const nextSortOrder = nextBucket.length;
    const currentSong = songs.find((song) => song.id === songId) ?? null;
    const nextNotes =
      status === "active" && currentSong
        ? withSongSetNumber(currentSong, defaultActiveSetNumber)
        : currentSong?.notes ?? null;

    setBusyKey(`stage:${songId}:${status}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await client
        .from("songs")
        .update({
          status,
          sort_order:
            status === "active" || status === "suggested" ? nextSortOrder : 0,
          notes: nextNotes,
        })
        .eq("id", songId);

      if (error) {
        throw error;
      }

      setSongs((current) =>
        current.map((song) =>
          song.id === songId
            ? {
                ...song,
                status,
                sort_order:
                  status === "active" || status === "suggested"
                    ? nextSortOrder
                    : song.sort_order,
                notes: song.id === songId ? nextNotes : song.notes,
              }
            : song,
        ),
      );
      setStatusMessage("Song status updated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to update song status."));
    } finally {
      setBusyKey(null);
    }
  }

  async function editSong(song: SongRecord) {
    if (!currentMember?.is_admin || !supabase) {
      return;
    }

    const nextTitle = window.prompt("Song title", song.title)?.trim();
    if (!nextTitle) {
      return;
    }

    const nextArtist = window.prompt("Artist", song.artist)?.trim();
    if (!nextArtist) {
      return;
    }

    setBusyKey(`edit:${song.id}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Missing member session. Please sign in again.");
      }

      const response = await fetch("/api/song-admin", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          songId: song.id,
          title: nextTitle,
          artist: nextArtist,
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        merged?: boolean;
        keptSongId?: string;
        removedSongId?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update song.");
      }

      await loadBoard();
      setStatusMessage(payload.merged ? "Songs merged automatically." : "Song updated.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to update song."));
    } finally {
      setBusyKey(null);
    }
  }

  async function importDefaultSongs() {
    if (!currentMember?.is_admin || !supabase) {
      return;
    }

    const client = supabase;
    setBusyKey("import:default");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const payload = defaultSongCatalog.map((song) => ({
        slug: song.slug,
        title: song.title,
        artist: song.artist,
        status: song.status,
        sort_order: song.sortOrder,
      }));

      const { error } = await client.from("songs").insert(payload);

      if (error) {
        throw error;
      }

      await loadBoard();
      setStatusMessage("Current repertoire imported.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to import songs."));
    } finally {
      setBusyKey(null);
    }
  }

  async function moveSongsWithinBucket(
    bucket: SongBucket,
    draggedSongId: string,
    targetSongId: string,
    position: "before" | "after",
  ) {
    if (!currentMember?.is_admin || !supabase) {
      return;
    }

    const client = supabase;
    const bucketSongs = songs
      .filter((song) => getSongBucket(song) === bucket)
      .sort((left, right) => left.sort_order - right.sort_order);
    const draggedIndex = bucketSongs.findIndex((song) => song.id === draggedSongId);
    const targetIndex = bucketSongs.findIndex((song) => song.id === targetSongId);

    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }

    const reordered = [...bucketSongs];
    const [draggedSong] = reordered.splice(draggedIndex, 1);
    const adjustedTargetIndex =
      draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
    const insertionIndex =
      position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex;
    const targetSong = bucketSongs[targetIndex];

    reordered.splice(insertionIndex, 0, draggedSong);
    const nextActiveSetNumber =
      bucket === "active" && targetSong ? getSongSetNumber(targetSong) : null;
    const updates = reordered.map((song, index) => ({
      id: song.id,
      sort_order: index,
      notes:
        bucket === "active" && song.id === draggedSongId && nextActiveSetNumber
          ? withSongSetNumber(song, nextActiveSetNumber)
          : song.notes,
    }));

    setBusyKey(`reorder:${bucket}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const results = await Promise.all(
        updates.map((update) =>
          client
            .from("songs")
            .update({ sort_order: update.sort_order, notes: update.notes })
            .eq("id", update.id),
        ),
      );

      const failedResult = results.find((result) => result.error);

      if (failedResult?.error) {
        throw failedResult.error;
      }

      setSongs((current) =>
        current.map((song) => {
          const next = updates.find((update) => update.id === song.id);
          return next
            ? { ...song, sort_order: next.sort_order, notes: next.notes }
            : song;
        }),
      );
      setStatusMessage(
        bucket === "active"
          ? "Active set order updated."
          : bucket === "suggested"
            ? "Suggested songs order updated."
            : "Archived song order updated.",
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to reorder songs."));
    } finally {
      setBusyKey(null);
      setDragSongId(null);
      setDragBucket(null);
      setDropIndicator(null);
    }
  }

  async function moveActiveSongToSet(songId: string, setNumber: number) {
    if (!currentMember?.is_admin || !supabase) {
      return;
    }

    const client = supabase;
    const reordered = activeSongs.filter((song) => song.id !== songId);
    const draggedSong = activeSongs.find((song) => song.id === songId);

    if (!draggedSong) {
      return;
    }

    reordered.push(draggedSong);
    const updates = reordered.map((song, index) => ({
      id: song.id,
      sort_order: index,
      notes:
        song.id === songId ? withSongSetNumber(song, setNumber) : song.notes,
    }));

    setBusyKey(`reorder:active`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const results = await Promise.all(
        updates.map((update) =>
          client
            .from("songs")
            .update({ sort_order: update.sort_order, notes: update.notes })
            .eq("id", update.id),
        ),
      );

      const failedResult = results.find((result) => result.error);

      if (failedResult?.error) {
        throw failedResult.error;
      }

      setSongs((current) =>
        current.map((song) => {
          const next = updates.find((update) => update.id === song.id);
          return next
            ? { ...song, sort_order: next.sort_order, notes: next.notes }
            : song;
        }),
      );
      setStatusMessage(`Moved song to Set ${setNumber}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Unable to move song to that set."));
    } finally {
      setBusyKey(null);
      setDragSongId(null);
      setDragBucket(null);
      setDropIndicator(null);
    }
  }

  function renderSongRow(song: SongRecord, index?: number) {
    const confidenceMap = songStatusMap.get(song.id) ?? new Map<string, SongConfidence>();
    const currentConfidence = currentMember
      ? confidenceMap.get(currentMember.id) ?? "dont_know"
      : "dont_know";
    const songBucket = getSongBucket(song);
    const isDraggable = Boolean(currentMember?.is_admin) && songBucket === "active";
    const isDragSource = dragSongId === song.id && dragBucket === songBucket;
    const rowDropPosition =
      dropIndicator?.songId === song.id && dropIndicator.bucket === songBucket
        ? dropIndicator.position
        : null;
    const explicitVoteCount = countedSuggestionVoteCountMap.get(song.id) ?? 0;
    const visibleVoteCount = visibleSuggestionVoteCountMap.get(song.id) ?? 0;
    const implicitActiveApproval =
      currentMember?.counts_toward_votes &&
      (song.status === "active" || song.status === "selected") &&
      explicitVoteCount < countedVotingMemberCount &&
      countedVotingMemberCount > 0;
    const voteCount = implicitActiveApproval
      ? Math.max(visibleVoteCount, explicitVoteCount)
      : visibleVoteCount;
    const currentMemberHasVoted = implicitActiveApproval
      ? true
      : currentMemberVoteSet.has(song.id);

    return (
      <li
        key={song.id}
        className={`song-board-row${isDraggable ? " is-draggable" : ""}${isDragSource ? " is-drag-source" : ""}${rowDropPosition ? ` is-drop-target-${rowDropPosition}` : ""}`}
        draggable={isDraggable}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          setDragSongId(song.id);
          setDragBucket(songBucket);
          setDropIndicator(null);
        }}
        onDragEnd={() => {
          setDragSongId(null);
          setDragBucket(null);
          setDropIndicator(null);
        }}
        onDragOver={(event) => {
          if (isDraggable && dragBucket === songBucket) {
            event.preventDefault();
            const bounds = event.currentTarget.getBoundingClientRect();
            const position =
              event.clientY - bounds.top < bounds.height / 2 ? "before" : "after";

            setDropIndicator((current) =>
              current?.songId === song.id &&
              current.bucket === songBucket &&
              current.position === position
                ? current
                : {
                    songId: song.id,
                    bucket: songBucket,
                    position,
                  },
            );
          }
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
            return;
          }

          setDropIndicator((current) =>
            current?.songId === song.id && current.bucket === songBucket
              ? null
              : current,
          );
        }}
        onDrop={() => {
          if (
            dragSongId &&
            dragBucket === songBucket &&
            dropIndicator?.songId === song.id &&
            dropIndicator.bucket === songBucket
          ) {
            void moveSongsWithinBucket(
              songBucket,
              dragSongId,
              song.id,
              dropIndicator.position,
            );
          }
        }}
      >
        <div className="song-board-main">
          {typeof index === "number" ? (
            <span className="song-row-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
          {isDraggable ? (
            <span className="song-drag-handle" aria-hidden="true">
              <svg viewBox="0 0 16 16" focusable="false">
                <circle cx="5" cy="4" r="1.2" />
                <circle cx="11" cy="4" r="1.2" />
                <circle cx="5" cy="8" r="1.2" />
                <circle cx="11" cy="8" r="1.2" />
                <circle cx="5" cy="12" r="1.2" />
                <circle cx="11" cy="12" r="1.2" />
              </svg>
            </span>
          ) : null}
          <div className="song-board-copy">
            <p className="song-board-title">
              <span>{song.title}</span>
              <span className="song-board-artist">{song.artist}</span>
            </p>
          </div>
        </div>

        <div className="song-board-controls">
          {(song.status === "suggested" ||
            song.status === "active" ||
            song.status === "selected") &&
          currentMember ? (
            <button
              type="button"
              className={`vote-chip vote-chip-vote vote-chip-icon${currentMemberHasVoted ? " is-active" : ""}`}
              disabled={busyKey === `vote:${song.id}` || !currentMember.can_vote}
              onClick={() => void toggleSuggestionVote(song)}
              title={
                !currentMember.can_vote
                  ? `${voteCount} total votes`
                  : currentMemberHasVoted
                    ? `Remove vote (${voteCount} total)`
                    : `Vote in (${voteCount} total)`
              }
              aria-label={
                !currentMember.can_vote
                  ? `${voteCount} total votes. Voting is disabled for this member.`
                  : currentMemberHasVoted
                    ? `Remove vote. ${voteCount} total votes.`
                    : `Vote in. ${voteCount} total votes.`
              }
            >
              <svg viewBox="0 0 20 20" focusable="false" aria-hidden="true">
                <path d="M8.6 2.5a1 1 0 0 1 .95 1.31l-1.13 3.38h5.2c1.44 0 2.43 1.42 1.95 2.77l-2.04 5.74A2 2 0 0 1 11.65 17H5.5a2 2 0 0 1-2-2V8.86a2 2 0 0 1 .59-1.42l2.74-2.75A2 2 0 0 0 7.3 3.8l.35-1.05a1 1 0 0 1 .95-.25Z" />
                <path d="M3 8.25h1.5V17H3.75A.75.75 0 0 1 3 16.25v-8Z" />
              </svg>
              <span>{voteCount}</span>
            </button>
          ) : null}

          <div className="song-board-avatars">
            {visibleVotingMembers.map((member) => {
              const confidence = confidenceMap.get(member.id) ?? "dont_know";

              return (
                <div
                  key={member.id}
                  className={`song-avatar song-avatar-${confidence}${currentMember?.id === member.id ? " is-current" : ""}${member.avatar_theme === "investor" ? " song-avatar-investor" : ""}`}
                  title={`${member.display_name}: ${songConfidenceLabels[confidence]}`}
                >
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.display_name} />
                  ) : (
                    <span>{getMemberAvatarLabel(member)}</span>
                  )}
                </div>
              );
            })}
          </div>

          {currentMember ? (
            <div className="confidence-toggle" aria-label="Set confidence">
              {(["dont_know", "kind_of_know", "know_it"] as SongConfidence[]).map(
                (confidence) => (
                  <button
                    key={confidence}
                    type="button"
                    className={currentConfidence === confidence ? "is-active" : undefined}
                    disabled={
                      busyKey === `confidence:${song.id}:${confidence}` ||
                      song.status === "archived" ||
                      !currentMember.can_vote
                    }
                    title={
                      !currentMember.can_vote
                        ? "Only band musicians can set song readiness."
                        : song.status === "archived"
                          ? "Archived songs cannot be updated."
                          : undefined
                    }
                    onClick={() => void updateConfidence(song.id, confidence)}
                  >
                    {confidence === "dont_know"
                      ? "Not Ready"
                      : confidence === "kind_of_know"
                        ? "Almost Ready"
                        : "Ready"}
                  </button>
                ),
              )}
            </div>
          ) : null}

          <div className="song-board-actions">
            {currentMember?.is_admin ? (
              <button
                type="button"
                className="vote-chip archive-action"
                disabled={busyKey === `edit:${song.id}`}
                onClick={() => void editSong(song)}
              >
                Edit
              </button>
            ) : null}
            {currentMember?.is_admin && song.status === "archived" ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:active`}
                onClick={() => void updateSongStage(song.id, "active")}
              >
                Restore To Active
              </button>
            ) : null}
            {currentMember?.is_admin && song.status === "archived" ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:suggested`}
                onClick={() => void updateSongStage(song.id, "suggested")}
              >
                Restore To Suggested
              </button>
            ) : null}
            {currentMember?.is_admin && song.status === "suggested" ? (
              <button
                type="button"
                className="vote-chip archive-action"
                disabled={busyKey === `stage:${song.id}:archived`}
                onClick={() => void updateSongStage(song.id, "archived")}
              >
                Archive
              </button>
            ) : null}
          </div>
        </div>
      </li>
    );
  }

  if (!hasPublicConfig) {
    return (
      <section className="section">
        <article className="panel songs-auth-panel">
          <div>
            <div className="section-heading">
              <h2>Member Access Needs Setup</h2>
            </div>
            <p className="songs-auth-copy">
              The site is missing the public Supabase environment variables needed to
              load the private songs board.
            </p>
          </div>
          <Link href="/members/sign-in" className="button-secondary">
            View Sign-In Setup
          </Link>
        </article>
      </section>
    );
  }

  if (!sessionUser) {
    return (
      <section className="section">
        <article className="panel songs-auth-panel">
          <div>
            <div className="section-heading">
              <h2>Band Access Required</h2>
            </div>
            <p className="songs-auth-copy">
              This board is private to band members. Sign in with your email or
              Google account to see the working set and update your readiness.
            </p>
          </div>
          <Link href="/members/sign-in" className="button-primary">
            Members Sign In
          </Link>
        </article>
      </section>
    );
  }

  if (!loading && members.length === 0) {
    return (
      <section className="section">
        <article className="panel songs-auth-panel">
          <div>
            <div className="section-heading">
              <h2>Access Pending</h2>
            </div>
            <p className="songs-auth-copy">
              You are signed in, but this account is not matched to an approved band
              member record yet. Add the member email in Supabase to finish access.
            </p>
          </div>
          <Link href="/members/sign-in" className="button-secondary">
            Try Another Sign In
          </Link>
        </article>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="songs-controls-panel">
        {actualMember?.is_admin ? (
          <div className="songs-admin-tools">
            <div className="songs-impersonation-panel">
              <label className="songs-impersonation-field">
                <span>Testing View</span>
                <select
                  className="songs-impersonation-select"
                  value={isImpersonating ? currentMember?.id ?? "" : ""}
                  onChange={(event) => {
                    const nextMemberId = event.target.value || null;
                    setImpersonatedMemberId(nextMemberId);
                    if (typeof window !== "undefined") {
                      if (nextMemberId) {
                        window.localStorage.setItem(
                          "songs-board-impersonation-member-id",
                          nextMemberId,
                        );
                      } else {
                        window.localStorage.removeItem(
                          "songs-board-impersonation-member-id",
                        );
                      }
                    }
                    setStatusMessage(null);
                    setErrorMessage(null);
                  }}
                >
                  <option value="">My admin view</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.display_name} | {member.instrument}
                    </option>
                  ))}
                </select>
              </label>
              {isImpersonating && currentMember ? (
                <p className="songs-impersonation-copy">
                  Testing as {currentMember.display_name}. Member actions run through an
                  admin-only proxy so you can vote, suggest songs, and update readiness
                  without leaving your account.
                </p>
              ) : (
                <p className="songs-impersonation-copy">
                  Switch into any member account to test their exact board experience.
                </p>
              )}
            </div>
            <div className="song-board-actions">
            {songs.length === 0 ? (
              <button
                type="button"
                className="button-secondary"
                disabled={busyKey === "import:default"}
                onClick={() => void importDefaultSongs()}
              >
                {busyKey === "import:default" ? "Importing..." : "Import Current Set"}
              </button>
            ) : null}
            </div>
          </div>
        ) : null}

        <form className="songs-suggestion-form" onSubmit={handleSuggestionSubmit}>
          <input
            type="text"
            placeholder="Suggest a song"
            value={suggestionTitle}
            onChange={(event) => setSuggestionTitle(event.target.value)}
          />
          <input
            type="text"
            placeholder="Artist"
            value={suggestionArtist}
            onChange={(event) => setSuggestionArtist(event.target.value)}
          />
          <button
            type="submit"
            className="button-primary"
            disabled={busyKey === "suggestion:create"}
          >
            {busyKey === "suggestion:create" ? "Adding..." : "Suggest"}
          </button>
        </form>

        {statusMessage ? <p className="status success">{statusMessage}</p> : null}
        {errorMessage ? <p className="status error">{errorMessage}</p> : null}
      </div>

      <article className="panel section">
        <div className="section-heading section-heading-with-actions">
          <h2>Active Set List</h2>
          <button type="button" className="section-action" onClick={exportActiveSetList}>
            Export PDF
          </button>
        </div>
        {loading ? (
          <p className="songs-auth-copy">Loading the current working set...</p>
        ) : activeSongs.length > 0 ? (
          <div className="active-set-grid">
            {activeSets.map((setGroup) => (
              <section key={setGroup.label} className="active-set-card">
                <div className="active-set-heading">
                  <h3>{setGroup.label}</h3>
                  <span>
                    {setGroup.songs.length} song{setGroup.songs.length === 1 ? "" : "s"}
                  </span>
                </div>
                {setGroup.songs.length > 0 ? (
                  <ol className="songs-board-list songs-board-list-numbered">
                    {setGroup.songs.map((song, index) =>
                      renderSongRow(song, index),
                    )}
                  </ol>
                ) : (
                  <div
                    className={`active-set-dropzone${
                      dragBucket === "active" ? " is-active" : ""
                    }`}
                    onDragOver={(event) => {
                      if (dragBucket === "active") {
                        event.preventDefault();
                      }
                    }}
                    onDrop={() => {
                      if (dragSongId && dragBucket === "active") {
                        void moveActiveSongToSet(dragSongId, setGroup.setNumber);
                      }
                    }}
                  >
                    <p className="songs-auth-copy">Drag a song here to place it in this set.</p>
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <p className="songs-auth-copy">No active songs match this view yet.</p>
        )}
      </article>

      <article className="panel section">
        <div className="section-heading section-heading-with-actions">
          <h2>Suggested Songs</h2>
          <button type="button" className="section-action" onClick={exportSuggestedSongs}>
            Export PDF
          </button>
        </div>
        {suggestedSongs.length > 0 ? (
          <ul className="songs-board-list">{suggestedSongs.map((song) => renderSongRow(song))}</ul>
        ) : (
          <p className="songs-auth-copy">
            No suggested songs yet. Add one above to get the queue started.
          </p>
        )}
      </article>

      {currentMember?.is_admin ? (
        <div className="songs-archived-toggle-wrap">
          <button
            type="button"
            className="songs-archived-toggle"
            onClick={() => setShowArchived((current) => !current)}
          >
            {showArchived
              ? "Hide Archived Songs"
              : `Show Archived Songs (${archivedSongs.length})`}
          </button>
        </div>
      ) : null}

      {currentMember?.is_admin && showArchived ? (
        <article className="panel section">
          <div className="section-heading">
            <h2>Archived Songs</h2>
          </div>
          {archivedSongs.length > 0 ? (
            <ul className="songs-board-list">{archivedSongs.map((song) => renderSongRow(song))}</ul>
          ) : (
            <p className="songs-auth-copy">No archived songs right now.</p>
          )}
        </article>
      ) : null}
    </section>
  );
}
