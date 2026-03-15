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

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

export function SongsBoard() {
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const [hasPublicConfig, setHasPublicConfig] = useState(true);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [members, setMembers] = useState<BandMember[]>([]);
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [statuses, setStatuses] = useState<SongMemberStatus[]>([]);
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
      const [membersResult, songsResult, statusesResult] = await Promise.all([
        client
          .from("band_members")
          .select("id, display_name, instrument, email, phone, avatar_url, is_admin")
          .order("created_at", { ascending: true }),
        client
          .from("songs")
          .select("id, slug, title, artist, status, sort_order, suggested_by_member_id, notes")
          .order("status", { ascending: true })
          .order("sort_order", { ascending: true })
          .order("title", { ascending: true }),
        client.from("song_member_statuses").select("song_id, member_id, confidence"),
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

      setMembers(membersResult.data ?? []);
      setSongs(songsResult.data ?? []);
      setStatuses(statusesResult.data ?? []);
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

  const activeSongs = songs
    .filter((song) => song.status === "active" || song.status === "selected")
    .sort((left, right) => left.sort_order - right.sort_order);
  const suggestedSongs = songs
    .filter((song) => song.status === "suggested")
    .sort((left, right) => left.sort_order - right.sort_order);
  const archivedSongs = songs
    .filter((song) => song.status === "archived")
    .sort((left, right) => left.sort_order - right.sort_order);
  const activeSets = Array.from({ length: 4 }, (_value, index) => ({
    label: `Set ${index + 1}`,
    songs: activeSongs.slice(index * 10, index * 10 + 10),
  }));
  const additionalActiveSongs = activeSongs.slice(40);

  async function updateConfidence(songId: string, confidence: SongConfidence) {
    if (!currentMember || !supabase) {
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

    reordered.splice(insertionIndex, 0, draggedSong);
    const updates = reordered.map((song, index) => ({
      id: song.id,
      sort_order: index,
    }));

    setBusyKey(`reorder:${bucket}`);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const results = await Promise.all(
        updates.map((update) =>
          client.from("songs").update({ sort_order: update.sort_order }).eq("id", update.id),
        ),
      );

      const failedResult = results.find((result) => result.error);

      if (failedResult?.error) {
        throw failedResult.error;
      }

      setSongs((current) =>
        current.map((song) => {
          const next = updates.find((update) => update.id === song.id);
          return next ? { ...song, sort_order: next.sort_order } : song;
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

  function renderSongRow(song: SongRecord, index?: number) {
    const confidenceMap = songStatusMap.get(song.id) ?? new Map<string, SongConfidence>();
    const currentConfidence = currentMember
      ? confidenceMap.get(currentMember.id) ?? "dont_know"
      : "dont_know";
    const songBucket = getSongBucket(song);
    const isDraggable =
      Boolean(currentMember?.is_admin) &&
      (songBucket === "active" || songBucket === "suggested");
    const rowDropPosition =
      dropIndicator?.songId === song.id && dropIndicator.bucket === songBucket
        ? dropIndicator.position
        : null;

    return (
      <li
        key={song.id}
        className={`song-board-row${isDraggable ? " is-draggable" : ""}${rowDropPosition ? ` is-drop-target-${rowDropPosition}` : ""}`}
        draggable={isDraggable}
        onDragStart={() => {
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

            setDropIndicator({
              songId: song.id,
              bucket: songBucket,
              position,
            });
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

        <div className="song-board-avatars">
          {members.map((member) => {
            const confidence = confidenceMap.get(member.id) ?? "dont_know";

            return (
              <div
                key={member.id}
                className={`song-avatar song-avatar-${confidence}${currentMember?.id === member.id ? " is-current" : ""}`}
                title={`${member.display_name}: ${songConfidenceLabels[confidence]}`}
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
                      song.status === "archived"
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
            {currentMember?.is_admin && song.status === "suggested" ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:active`}
                onClick={() => void updateSongStage(song.id, "active")}
              >
                Add To Active
              </button>
            ) : null}
            {currentMember?.is_admin &&
            (song.status === "active" || song.status === "selected") ? (
              <button
                type="button"
                className="vote-chip"
                disabled={busyKey === `stage:${song.id}:suggested`}
                onClick={() => void updateSongStage(song.id, "suggested")}
              >
                Move To Suggested
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
        {currentMember?.is_admin ? (
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
          <h2>Active Set List</h2>
        </div>
        {loading ? (
          <p className="songs-auth-copy">Loading the current working set...</p>
        ) : activeSongs.length > 0 ? (
          <div className="active-set-grid">
            {activeSets.map((setGroup) => (
              <section key={setGroup.label} className="active-set-card">
                <div className="active-set-heading">
                  <h3>{setGroup.label}</h3>
                  <span>{setGroup.songs.length}/10 songs</span>
                </div>
                {setGroup.songs.length > 0 ? (
                  <ol className="songs-board-list songs-board-list-numbered">
                    {setGroup.songs.map((song, index) =>
                      renderSongRow(song, (Number(setGroup.label.split(" ")[1]) - 1) * 10 + index),
                    )}
                  </ol>
                ) : (
                  <p className="songs-auth-copy">No songs in this set yet.</p>
                )}
              </section>
            ))}
            {additionalActiveSongs.length > 0 ? (
              <section className="active-set-card active-set-card-overflow">
                <div className="active-set-heading">
                  <h3>Additional Songs</h3>
                  <span>{additionalActiveSongs.length} overflow</span>
                </div>
                <ol className="songs-board-list songs-board-list-numbered">
                  {additionalActiveSongs.map((song, index) =>
                    renderSongRow(song, 40 + index),
                  )}
                </ol>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="songs-auth-copy">No active songs match this view yet.</p>
        )}
      </article>

      <article className="panel section">
        <div className="section-heading">
          <h2>Suggested Songs</h2>
        </div>
        {suggestedSongs.length > 0 ? (
          <ul className="songs-board-list">{suggestedSongs.map((song) => renderSongRow(song))}</ul>
        ) : (
          <p className="songs-auth-copy">
            No suggested songs yet. Add one above to get the queue started.
          </p>
        )}
      </article>

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
