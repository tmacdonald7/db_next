import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type BandMemberRow = {
  id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  is_admin: boolean;
  can_vote: boolean;
  counts_toward_votes: boolean;
};

type SongRow = {
  id: string;
  status: "active" | "selected" | "suggested" | "archived";
  sort_order: number;
  notes: string | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
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
    .select("id, display_name, email, phone, is_admin, can_vote, counts_toward_votes")
    .limit(1);

  if (email) {
    query = query.eq("email", email);
  } else if (phone) {
    query = query.eq("phone", phone);
  } else {
    return { error: NextResponse.json({ error: "Member session is missing contact info." }, { status: 401 }) };
  }

  const memberResult = await query.maybeSingle<BandMemberRow>();

  if (memberResult.error || !memberResult.data?.is_admin) {
    return { error: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }

  return { supabase, adminMember: memberResult.data };
}

export async function POST(request: Request) {
  try {
    const adminCheck = await requireAdmin(request);

    if ("error" in adminCheck) {
      return adminCheck.error;
    }

    const { supabase } = adminCheck;
    const body = (await request.json()) as {
      action?: "toggle_vote" | "update_confidence" | "suggest_song";
      memberId?: string;
      songId?: string;
      confidence?: "dont_know" | "kind_of_know" | "know_it";
      title?: string;
      artist?: string;
    };

    const action = body.action;
    const memberId = body.memberId?.trim();

    if (!action || !memberId) {
      return NextResponse.json({ error: "Provide an action and member id." }, { status: 400 });
    }

    const memberResult = await supabase
      .from("band_members")
      .select("id, display_name, email, phone, is_admin, can_vote, counts_toward_votes")
      .eq("id", memberId)
      .maybeSingle<BandMemberRow>();

    if (memberResult.error) {
      throw memberResult.error;
    }

    if (!memberResult.data) {
      return NextResponse.json({ error: "Band member not found." }, { status: 404 });
    }

    const member = memberResult.data;

    if (action === "suggest_song") {
      const title = body.title?.trim();
      const artist = body.artist?.trim();

      if (!title || !artist) {
        return NextResponse.json({ error: "Add both a song title and an artist." }, { status: 400 });
      }

      const suggestedCountResult = await supabase
        .from("songs")
        .select("id", { count: "exact", head: true })
        .eq("status", "suggested");

      if (suggestedCountResult.error) {
        throw suggestedCountResult.error;
      }

      const slug = `${title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}--${artist
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")}`;

      const insertResult = await supabase
        .from("songs")
        .insert({
          slug,
          title,
          artist,
          status: "suggested",
          sort_order: suggestedCountResult.count ?? 0,
          suggested_by_member_id: member.id,
        })
        .select("id")
        .single();

      if (insertResult.error) {
        throw insertResult.error;
      }

      return NextResponse.json({ statusMessage: `Suggested song added as ${member.display_name}.` });
    }

    if (!member.can_vote) {
      return NextResponse.json(
        { error: `${member.display_name} cannot vote or set readiness.` },
        { status: 400 },
      );
    }

    if (action === "update_confidence") {
      const songId = body.songId?.trim();
      const confidence = body.confidence;

      if (!songId || !confidence) {
        return NextResponse.json({ error: "Provide a song and confidence value." }, { status: 400 });
      }

      const upsertResult = await supabase.from("song_member_statuses").upsert(
        {
          song_id: songId,
          member_id: member.id,
          confidence,
        },
        { onConflict: "song_id,member_id" },
      );

      if (upsertResult.error) {
        throw upsertResult.error;
      }

      return NextResponse.json({ statusMessage: `Confidence updated as ${member.display_name}.` });
    }

    if (action === "toggle_vote") {
      const songId = body.songId?.trim();

      if (!songId) {
        return NextResponse.json({ error: "Provide a song id." }, { status: 400 });
      }

      const [songResult, votesResult, countedMembersResult] = await Promise.all([
        supabase
          .from("songs")
          .select("id, status, sort_order, notes")
          .eq("id", songId)
          .maybeSingle<SongRow>(),
        supabase.from("song_suggestion_votes").select("member_id").eq("song_id", songId),
        supabase
          .from("band_members")
          .select("id")
          .eq("can_vote", true)
          .eq("counts_toward_votes", true),
      ]);

      if (songResult.error) throw songResult.error;
      if (votesResult.error) throw votesResult.error;
      if (countedMembersResult.error) throw countedMembersResult.error;

      if (!songResult.data) {
        return NextResponse.json({ error: "Song not found." }, { status: 404 });
      }

      const song = songResult.data;
      const existingVotes = votesResult.data ?? [];
      const countedMemberIds = new Set((countedMembersResult.data ?? []).map((entry) => entry.id));
      const countedVoteMemberIds = new Set(
        existingVotes
          .filter((vote) => countedMemberIds.has(vote.member_id))
          .map((vote) => vote.member_id),
      );
      const countedMemberCount = countedMemberIds.size;
      const hasExplicitVote = existingVotes.some((vote) => vote.member_id === member.id);
      const hasImplicitApproval =
        member.counts_toward_votes &&
        (song.status === "active" || song.status === "selected") &&
        countedMemberCount > 0 &&
        countedVoteMemberIds.size < countedMemberCount;

      if (hasExplicitVote || hasImplicitApproval) {
        const deleteResult = await supabase
          .from("song_suggestion_votes")
          .delete()
          .eq("song_id", songId)
          .eq("member_id", member.id);

        if (deleteResult.error) {
          throw deleteResult.error;
        }

        if (hasImplicitApproval) {
          const missingVotes = (countedMembersResult.data ?? [])
            .filter((entry) => entry.id !== member.id && !countedVoteMemberIds.has(entry.id))
            .map((entry) => ({
              song_id: songId,
              member_id: entry.id,
            }));

          if (missingVotes.length > 0) {
            const restoreResult = await supabase
              .from("song_suggestion_votes")
              .upsert(missingVotes, { onConflict: "song_id,member_id" });

            if (restoreResult.error) {
              throw restoreResult.error;
            }
          }
        }

        const nextCountedVoteCount = hasImplicitApproval
          ? Math.max(0, countedMemberCount - 1)
          : existingVotes.filter(
              (vote) => vote.member_id !== member.id && countedMemberIds.has(vote.member_id),
            ).length;

        if (
          (song.status === "active" || song.status === "selected") &&
          countedMemberCount > 0 &&
          nextCountedVoteCount < countedMemberCount
        ) {
          const suggestedCountResult = await supabase
            .from("songs")
            .select("id", { count: "exact", head: true })
            .eq("status", "suggested");

          if (suggestedCountResult.error) {
            throw suggestedCountResult.error;
          }

          const updateSongResult = await supabase
            .from("songs")
            .update({
              status: "suggested",
              sort_order: suggestedCountResult.count ?? 0,
            })
            .eq("id", songId);

          if (updateSongResult.error) {
            throw updateSongResult.error;
          }

          return NextResponse.json({
            statusMessage: `Vote removed as ${member.display_name}. Song moved back to suggested songs.`,
          });
        }

        return NextResponse.json({ statusMessage: `Vote removed as ${member.display_name}.` });
      }

      const insertVoteResult = await supabase
        .from("song_suggestion_votes")
        .insert({
          song_id: songId,
          member_id: member.id,
        });

      if (insertVoteResult.error) {
        throw insertVoteResult.error;
      }

      const nextCountedVoteCount =
        existingVotes.filter((vote) => countedMemberIds.has(vote.member_id)).length +
        (member.counts_toward_votes ? 1 : 0);

      if (countedMemberCount > 0 && nextCountedVoteCount >= countedMemberCount) {
        const activeCountResult = await supabase
          .from("songs")
          .select("id", { count: "exact", head: true })
          .in("status", ["active", "selected"]);

        if (activeCountResult.error) {
          throw activeCountResult.error;
        }

        const activateSongResult = await supabase
          .from("songs")
          .update({
            status: "active",
            sort_order: activeCountResult.count ?? song.sort_order,
          })
          .eq("id", songId);

        if (activateSongResult.error) {
          throw activateSongResult.error;
        }

        return NextResponse.json({
          statusMessage: `Vote added as ${member.display_name}. Song moved to the active set list.`,
        });
      }

      return NextResponse.json({ statusMessage: `Vote added as ${member.display_name}.` });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    console.error("member-impersonation action failed", error);
    return NextResponse.json(
      { error: getErrorMessage(error, "Unable to complete the impersonated action.") },
      { status: 500 },
    );
  }
}
