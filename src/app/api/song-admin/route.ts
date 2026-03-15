import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type SongRow = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  status: "active" | "selected" | "suggested" | "archived";
  sort_order: number;
  notes: string | null;
};

type SongMemberStatusRow = {
  song_id: string;
  member_id: string;
  confidence: "dont_know" | "kind_of_know" | "know_it";
};

function slugifySongPart(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getSongSlug(title: string, artist: string) {
  return `${slugifySongPart(title)}--${slugifySongPart(artist)}`;
}

function getStatusPriority(status: SongRow["status"]) {
  switch (status) {
    case "active":
    case "selected":
      return 3;
    case "suggested":
      return 2;
    case "archived":
    default:
      return 1;
  }
}

function pickMergedStatus(source: SongRow, target: SongRow) {
  return getStatusPriority(source.status) >= getStatusPriority(target.status)
    ? source.status === "selected"
      ? "active"
      : source.status
    : target.status === "selected"
      ? "active"
      : target.status;
}

function getConfidencePriority(confidence: SongMemberStatusRow["confidence"]) {
  switch (confidence) {
    case "know_it":
      return 3;
    case "kind_of_know":
      return 2;
    case "dont_know":
    default:
      return 1;
  }
}

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Missing authorization." }, { status: 401 }) };
  }

  const token = authorization.slice("Bearer ".length);
  const supabase = createSupabaseAdminClient();
  const userResult = await supabase.auth.getUser(token);

  if (userResult.error || !userResult.data.user) {
    return { error: NextResponse.json({ error: "Unable to verify member session." }, { status: 401 }) };
  }

  const user = userResult.data.user;
  const email = user.email?.toLowerCase() ?? null;
  const phone = user.phone ?? null;

  let query = supabase
    .from("band_members")
    .select("id, is_admin")
    .limit(1);

  if (email) {
    query = query.eq("email", email);
  } else if (phone) {
    query = query.eq("phone", phone);
  } else {
    return { error: NextResponse.json({ error: "Member session is missing contact info." }, { status: 401 }) };
  }

  const memberResult = await query.maybeSingle();

  if (memberResult.error || !memberResult.data?.is_admin) {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { supabase, memberId: memberResult.data.id };
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);

    if ("error" in adminCheck) {
      return adminCheck.error;
    }

    const { supabase } = adminCheck;
    const body = (await request.json()) as {
      songId?: string;
      title?: string;
      artist?: string;
    };

    const songId = body.songId?.trim();
    const title = body.title?.trim();
    const artist = body.artist?.trim();

    if (!songId || !title || !artist) {
      return NextResponse.json(
        { error: "Provide a song id, title, and artist." },
        { status: 400 },
      );
    }

    const slug = getSongSlug(title, artist);

    const sourceResult = await supabase
      .from("songs")
      .select("id, slug, title, artist, status, sort_order, notes")
      .eq("id", songId)
      .maybeSingle<SongRow>();

    if (sourceResult.error) {
      throw sourceResult.error;
    }

    if (!sourceResult.data) {
      return NextResponse.json({ error: "Song not found." }, { status: 404 });
    }

    const sourceSong = sourceResult.data;

    const duplicateResult = await supabase
      .from("songs")
      .select("id, slug, title, artist, status, sort_order, notes")
      .eq("slug", slug)
      .neq("id", sourceSong.id)
      .maybeSingle<SongRow>();

    if (duplicateResult.error) {
      throw duplicateResult.error;
    }

    if (!duplicateResult.data) {
      const updateResult = await supabase
        .from("songs")
        .update({ title, artist, slug })
        .eq("id", sourceSong.id)
        .select("id")
        .single();

      if (updateResult.error) {
        throw updateResult.error;
      }

      return NextResponse.json({ merged: false });
    }

    const targetSong = duplicateResult.data;

    const [sourceStatusesResult, targetStatusesResult, sourceVotesResult] = await Promise.all([
      supabase
        .from("song_member_statuses")
        .select("song_id, member_id, confidence")
        .eq("song_id", sourceSong.id),
      supabase
        .from("song_member_statuses")
        .select("song_id, member_id, confidence")
        .eq("song_id", targetSong.id),
      supabase
        .from("song_suggestion_votes")
        .select("song_id, member_id")
        .eq("song_id", sourceSong.id),
    ]);

    if (sourceStatusesResult.error) throw sourceStatusesResult.error;
    if (targetStatusesResult.error) throw targetStatusesResult.error;
    if (sourceVotesResult.error) throw sourceVotesResult.error;

    const mergedStatuses = new Map<string, SongMemberStatusRow>();

    for (const row of targetStatusesResult.data ?? []) {
      mergedStatuses.set(row.member_id, row);
    }

    for (const row of sourceStatusesResult.data ?? []) {
      const existing = mergedStatuses.get(row.member_id);
      if (
        !existing ||
        getConfidencePriority(row.confidence) > getConfidencePriority(existing.confidence)
      ) {
        mergedStatuses.set(row.member_id, {
          song_id: targetSong.id,
          member_id: row.member_id,
          confidence: row.confidence,
        });
      }
    }

    const mergedVotes = (sourceVotesResult.data ?? []).map((vote) => ({
      song_id: targetSong.id,
      member_id: vote.member_id,
    }));

    const mergedStatus = pickMergedStatus(sourceSong, targetSong);
    const mergedSortOrder = Math.min(sourceSong.sort_order, targetSong.sort_order);
    const mergedNotes =
      getStatusPriority(sourceSong.status) >= getStatusPriority(targetSong.status)
        ? sourceSong.notes
        : targetSong.notes;

    const updateTargetResult = await supabase
      .from("songs")
      .update({
        title,
        artist,
        slug,
        status: mergedStatus,
        sort_order: mergedSortOrder,
        notes: mergedNotes,
      })
      .eq("id", targetSong.id);

    if (updateTargetResult.error) {
      throw updateTargetResult.error;
    }

    if (mergedStatuses.size > 0) {
      const upsertStatusesResult = await supabase
        .from("song_member_statuses")
        .upsert([...mergedStatuses.values()], { onConflict: "song_id,member_id" });

      if (upsertStatusesResult.error) {
        throw upsertStatusesResult.error;
      }
    }

    if (mergedVotes.length > 0) {
      const upsertVotesResult = await supabase
        .from("song_suggestion_votes")
        .upsert(mergedVotes, { onConflict: "song_id,member_id" });

      if (upsertVotesResult.error) {
        throw upsertVotesResult.error;
      }
    }

    const cleanupStatusesResult = await supabase
      .from("song_member_statuses")
      .delete()
      .eq("song_id", sourceSong.id);
    if (cleanupStatusesResult.error) throw cleanupStatusesResult.error;

    const cleanupVotesResult = await supabase
      .from("song_suggestion_votes")
      .delete()
      .eq("song_id", sourceSong.id);
    if (cleanupVotesResult.error) throw cleanupVotesResult.error;

    const deleteSourceResult = await supabase.from("songs").delete().eq("id", sourceSong.id);
    if (deleteSourceResult.error) throw deleteSourceResult.error;

    return NextResponse.json({
      merged: true,
      keptSongId: targetSong.id,
      removedSongId: sourceSong.id,
    });
  } catch (error) {
    console.error("song-admin update failed", error);
    return NextResponse.json(
      { error: "Unable to update that song right now." },
      { status: 500 },
    );
  }
}
