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
  songConfidenceOpacity,
  type SongConfidence,
  type SongStage,
} from "@/lib/songs";

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
  is_admin: boolean;
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

type SongVote = {
  song_id: string;
  member_id: string;
};

type FilterMode = "all" | "my_weak_spots" | "ready" | "learning";

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

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const [votes, setVotes] = useState<SongVote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionArtist, setSuggestionArtist] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [dragSongId, setDragSongId] = useState<string | null>(null);

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
      const [membersResult, songsResult, statusesResult, votesResult] =
        await Promise.all([
          client
            .from("band_members")
            .select("id, display_name, instrument, email, phone, avatar_url, is_admin")
            .order("created_at", { ascending: true }),
          client
            .from("songs")
            .select("id, slug, title, artist, status, sort_order, suggested_by_member_id, notes")
            .neq("status", "archived")
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
      setVotes(votesResult.data ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load the songs board right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionUser) {
      setMembers([]);
      setSongs([]);
      setStatuses([]);
      setVotes([]);
      setLoading(false);
      return;
    }

    if (!supabase) {
      return;
    }

    void loadBoard();
  }, [sessionUser, supabase]);

  const currentMember = useMemo(
    () => members.find((member) => matchesCurrentMember(member, sessionUser)) ?? null,
    [members, sessionUser],
  );

  const songStatusMap = useMemo(() => {
    const map = new Map<string, Map<string, SongConfidence>>();

    for (const status of statuses) {
      const songMap = map.get(status.song_id) ?? new Map<string, SongConfidence>();
      songMap.set(status.member_id, status.confidence);
      map.set(status.song_id, songMap);
    }

    return map;
  }, [statuses]);

  const songVoteMap = useMemo(() => {
    const map = new Map<string, Set<string>>();

    for (const vote of votes) {
      const songSet = map.get(vote.song_id) ?? new Set<string>();
      songSet.add(vote.member_id);
      map.set(vote.song_id, songSet);
    }

    return map;
  }, [votes]);

  const filteredSongs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesQuery =
        !query ||
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query);

      if (!matchesQuery) {
        return false;
      }

      const confidenceMap = songStatusMap.get(song.id);
      const knowCount = members.filter(
        (member) => confidenceMap?.get(member.id) === "know_it",
      ).length;
      const currentConfidence = currentMember
        ? confidenceMap?.get(currentMember.id) ?? "dont_know"
        : "dont_know";

      if (filterMode === "my_weak_spots") {
        return currentConfidence !== "know_it";
      }
      if (filterMode === "ready") {
        return members.length > 0 && knowCount === members.length;
      }
      if (filterMode === "learning") {
        return knowCount < members.length;
      }

      return true;
    });
  }, [currentMember, filterMode, members, searchQuery, songStatusMap, songs]);

  const activeSongs = filteredSongs.filter((song) => song.status === "active");
  const selectedSongs = filteredSongs
    .filter((song) => song.status === "selected")
    .sort((left, right) => left.sort_order - right.sort_order);
  const suggestedSongs = filteredSongs.filter((song) => song.status === "suggested");

  async function updateConfidence(songId: string, confidence: SongConfidence) {
    if (!currentMember) {
      return;
    }
    if (!supabase) {
      return;
    }

    const client = supabase;
    setBusyKey(`confidence:${songId}:${confidence}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
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
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update confidence.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleSuggestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentMember) {
      return;
    }
    if (!supabase) {
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
      setStatusMessage("Suggestion added.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to add the suggestion.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function toggleSuggestionVote(songId: string) {
    if (!currentMember) {
      return;
    }
    if (!supabase) {
      return;
    }

    const hasVote = songVoteMap.get(songId)?.has(currentMember.id) ?? false;
    const client = supabase;
    setBusyKey(`vote:${songId}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      if (hasVote) {
        const { error } = await client
          .from("song_suggestion_votes")
          .delete()
          .eq("song_id", songId)
          .eq("member_id", currentMember.id);

        if (error) {
          throw error;
        }

        setVotes((current) =>
          current.filter(
            (vote) =>
              !(vote.song_id === songId && vote.member_id === currentMember.id),
          ),
        );
      } else {
        const { error } = await client.from("song_suggestion_votes").insert({
          song_id: songId,
          member_id: currentMember.id,
        });

        if (error) {
          throw error;
        }

        setVotes((current) => [
          ...current,
          { song_id: songId, member_id: currentMember.id },
        ]);
      }

      setStatusMessage(hasVote ? "Vote removed." : "Vote added.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update vote.");
    } finally {
      setBusyKey(null);
    }
  }

  async function updateSongStage(songId: string, status: SongStage) {
    if (!supabase) {
      return;
    }

    const client = supabase;
    setBusyKey(`stage:${songId}:${status}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await client.from("songs").update({ status }).eq("id", songId);

      if (error) {
        throw error;
      }

      setSongs((current) =>
        current.map((song) => (song.id === songId ? { ...song, status } : song)),
      );
      setStatusMessage("Song status updated.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update song status.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function importDefaultSongs() {
    if (!currentMember?.is_admin) {
      return;
    }
    if (!supabase) {
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
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to import songs.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function moveSelectedSong(draggedSongId: string, targetSongId: string) {
    if (!currentMember?.is_admin || draggedSongId === targetSongId) {
      return;
    }
    if (!supabase) {
      return;
    }

    const client = supabase;
    const selectedOnly = songs
      .filter((song) => song.status === "selected")
      .sort((left, right) => left.sort_order - right.sort_order);
    const draggedIndex = selectedOnly.findIndex((song) => song.id === draggedSongId);
    const targetIndex = selectedOnly.findIndex((song) => song.id === targetSongId);

    if (draggedIndex < 0 || targetIndex < 0) {
      return;
    }

    const reordered = [...selectedOnly];
    const [draggedSong] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedSong);
    const updates = reordered.map((song, index) => ({
      id: song.id,
      sort_order: index,
    }));

    setBusyKey("reorder:selected");
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await client.from("songs").upsert(updates, {
        onConflict: "id",
      });

      if (error) {
        throw error;
      }

      setSongs((current) =>
        current.map((song) => {
          const next = updates.find((update) => update.id === song.id);
          return next ? { ...song, sort_order: next.sort_order } : song;
        }),
      );
      setStatusMessage("Selected order updated.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to reorder selected songs.",
      );
    } finally {
      setBusyKey(null);
      setDragSongId(null);
    }
  }

  function renderSongRow(song: SongRecord) {
    const confidenceMap = songStatusMap.get(song.id) ?? new Map<string, SongConfidence>();
    const knowCount = members.filter(
      (member) => confidenceMap.get(member.id) === "know_it",
    ).length;
    const currentConfidence = currentMember
      ? confidenceMap.get(currentMember.id) ?? "dont_know"
      : "dont_know";
    const voteCount = songVoteMap.get(song.id)?.size ?? 0;
    const currentMemberVoted = currentMember
      ? songVoteMap.get(song.id)?.has(currentMember.id) ?? false
      : false;
    const suggestedBy = song.suggested_by_member_id
      ? members.find((member) => member.id === song.suggested_by_member_id)
      : null;

    return (
      <li
        key={song.id}
        className={`song-board-row${currentMember?.is_admin && song.status === "selected" ? " is-draggable" : ""}`}
        draggable={Boolean(currentMember?.is_admin && song.status === "selected")}
        onDragStart={() => setDragSongId(song.id)}
        onDragOver={(event) => {
          if (currentMember?.is_admin && song.status === "selected") {
            event.preventDefault();
          }
        }}
        onDrop={() => {
          if (dragSongId) {
            void moveSelectedSong(dragSongId, song.id);
          }
        }}
      >
        <div className="song-board-main">
          {currentMember?.is_admin && song.status === "selected" ? (
            <span className="song-drag-handle" aria-hidden="true">
              ≡
            </span>
          ) : null}
          <div className="song-board-copy">
            <p className="song-board-title">{song.title}</p>
            <p className="song-board-artist">
              {song.artist}
              {suggestedBy ? ` • suggested by ${suggestedBy.display_name}` : ""}
            </p>
          </div>
        </div>

        <div className="song-board-avatars">
          {members.map((member) => {
            const confidence = confidenceMap.get(member.id) ?? "dont_know";

            return (
              <div
                key={member.id}
                className={`song-avatar${currentMember?.id === member.id ? " is-current" : ""}`}
                title={`${member.display_name}: ${songConfidenceLabels[confidence]}`}
                style={{ opacity: songConfidenceOpacity[confidence] }}
              >
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.display_name} />
                ) : (
                  <span>{getMemberInitials(member.display_name)}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="song-board-meta">
          <span className="song-board-ready">
            {knowCount}/{members.length || 0} ready
          </span>
          {song.status === "suggested" ? (
            <span className="song-board-votes">{voteCount} set votes</span>
          ) : null}
        </div>

        <div className="song-board-controls">
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
                      song.status === "suggested"
                    }
                    onClick={() => void updateConfidence(song.id, confidence)}
                  >
                    {confidence === "dont_know"
                      ? "No"
                      : confidence === "kind_of_know"
                        ? "Close"
                        : "Ready"}
                  </button>
                ),
              )}
            </div>
          ) : null}

          <div className="song-board-actions">
            {song.status === "suggested" && currentMember ? (
              <button
                type="button"
                className={`vote-chip${currentMemberVoted ? " is-active" : ""}`}
                disabled={busyKey === `vote:${song.id}`}
                onClick={() => void toggleSuggestionVote(song.id)}
              >
                {currentMemberVoted ? "Voted In" : "Vote In"}
              </button>
            ) : null}
            {currentMember?.is_admin && song.status === "suggested" ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:selected`}
                onClick={() => void updateSongStage(song.id, "selected")}
              >
                Promote
              </button>
            ) : null}
            {currentMember?.is_admin && song.status === "selected" ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:active`}
                onClick={() => void updateSongStage(song.id, "active")}
              >
                Move To Active
              </button>
            ) : null}
            {currentMember?.is_admin && song.status !== "archived" ? (
              <button
                type="button"
                className="vote-chip"
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
              This board is private to band members. Sign in with your phone, email,
              or Google account to see the working set and update your readiness.
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
              member record yet. Add the member email or phone in Supabase to finish access.
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
      <article className="panel songs-auth-panel">
        <div>
          <div className="section-heading">
            <h2>Band Repertoire Board</h2>
          </div>
          <p className="songs-auth-copy">
            Active songs are the current expectation, selected songs are the next wave,
            and suggestions are where members can lobby for additions.
          </p>
        </div>
        <div className="song-board-actions">
          {currentMember?.is_admin && songs.length === 0 ? (
            <button
              type="button"
              className="button-secondary"
              disabled={busyKey === "import:default"}
              onClick={() => void importDefaultSongs()}
            >
              {busyKey === "import:default" ? "Importing..." : "Import Current Set"}
            </button>
          ) : null}
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              if (supabase) {
                void supabase.auth.signOut();
              }
              setStatusMessage("Signed out.");
            }}
          >
            Sign Out
          </button>
        </div>
      </article>

      <div className="panel">
        <div className="songs-toolbar">
          <label className="songs-toolbar-search">
            Search songs
            <input
              type="search"
              placeholder="Search title or artist"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <label className="songs-toolbar-filter">
            Filter
            <select
              value={filterMode}
              onChange={(event) => setFilterMode(event.target.value as FilterMode)}
            >
              <option value="all">All songs</option>
              <option value="my_weak_spots">My weak spots</option>
              <option value="ready">Everyone knows it</option>
              <option value="learning">Still learning</option>
            </select>
          </label>
        </div>

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
        <div className="section-heading">
          <h2>Active Set</h2>
        </div>
        {loading ? (
          <p className="songs-auth-copy">Loading the current working set...</p>
        ) : activeSongs.length > 0 ? (
          <ul className="songs-board-list">{activeSongs.map(renderSongRow)}</ul>
        ) : (
          <p className="songs-auth-copy">No active songs match this view yet.</p>
        )}
      </article>

      <article className="panel section">
        <div className="section-heading">
          <h2>Selected Next</h2>
        </div>
        {selectedSongs.length > 0 ? (
          <ul className="songs-board-list">{selectedSongs.map(renderSongRow)}</ul>
        ) : (
          <p className="songs-auth-copy">No selected songs are waiting in the queue right now.</p>
        )}
      </article>

      <article className="panel section">
        <div className="section-heading">
          <h2>Suggestions</h2>
        </div>
        {suggestedSongs.length > 0 ? (
          <ul className="songs-board-list">{suggestedSongs.map(renderSongRow)}</ul>
        ) : (
          <p className="songs-auth-copy">No suggestions yet. Add one above to get the queue started.</p>
        )}
      </article>
    </section>
  );
}
