"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export type BookingActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialBookingActionState: BookingActionState = {
  status: "idle",
  message: "",
};

const requiredFieldMessages: Record<string, string> = {
  venue_name: "Venue name is required.",
  event_type: "Event type is required.",
  date: "Date is required.",
  start_time: "Start time is required.",
  duration_hours: "Duration is required.",
  location: "Location is required.",
  expected_attendance: "Expected attendance is required.",
  budget_range: "Budget range is required.",
  contact_name: "Contact name is required.",
  phone: "Phone number is required.",
  email: "Email is required.",
};

export async function submitBookingInquiry(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  for (const [field, message] of Object.entries(requiredFieldMessages)) {
    if (!String(formData.get(field) ?? "").trim()) {
      return { status: "error", message };
    }
  }

  try {
    const supabase = createSupabaseServerClient();

    const payload = {
      venue_name: String(formData.get("venue_name")),
      event_type: String(formData.get("event_type")),
      date: String(formData.get("date")),
      start_time: String(formData.get("start_time")),
      duration_hours: Number(formData.get("duration_hours")),
      location: String(formData.get("location")),
      expected_attendance: Number(formData.get("expected_attendance")),
      budget_range: String(formData.get("budget_range")),
      contact_name: String(formData.get("contact_name")),
      phone: String(formData.get("phone")),
      email: String(formData.get("email")),
      notes: String(formData.get("notes") ?? ""),
      status: "new",
    };

    const { error } = await supabase.from("booking_inquiries").insert(payload);

    if (error) {
      return {
        status: "error",
        message: `Submission failed: ${error.message}`,
      };
    }

    return {
      status: "success",
      message: "Inquiry sent successfully. We will follow up with availability and pricing.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
