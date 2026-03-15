import { NextResponse } from "next/server";
import { normalizeEmail, normalizePhoneNumber } from "@/lib/member-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      phone?: string;
    };

    const email = body.email ? normalizeEmail(body.email) : null;
    const phone = body.phone ? normalizePhoneNumber(body.phone) : null;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Provide a valid phone number or email address." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const baseQuery = supabase
      .from("band_members")
      .select("id, display_name, instrument, email, phone, is_admin")
      .limit(1);

    const result = email
      ? await baseQuery.eq("email", email).maybeSingle()
      : await baseQuery.eq("phone", phone).maybeSingle();

    if (result.error) {
      throw result.error;
    }

    if (!result.data) {
      return NextResponse.json(
        { error: "That contact method is not approved for band access yet." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      member: {
        displayName: result.data.display_name,
        instrument: result.data.instrument,
        hasEmail: Boolean(result.data.email),
        hasPhone: Boolean(result.data.phone),
        isAdmin: result.data.is_admin,
      },
    });
  } catch (error) {
    console.error("member-access lookup failed", error);
    return NextResponse.json(
      { error: "Unable to verify band access right now." },
      { status: 500 },
    );
  }
}
