"use server";

import { createSupabaseServerClient } from "@/lib/supabase";

export type ContactActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialContactActionState: ContactActionState = {
  status: "idle",
  message: "",
};

const requiredFieldMessages: Record<string, string> = {
  contact_name: "Name is required.",
  email: "Email is required.",
  phone: "Phone is required.",
  message: "Message is required.",
};

export async function submitContactInquiry(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  for (const [field, message] of Object.entries(requiredFieldMessages)) {
    if (!String(formData.get(field) ?? "").trim()) {
      return { status: "error", message };
    }
  }

  try {
    const supabase = createSupabaseServerClient();

    const payload = {
      contact_name: String(formData.get("contact_name")),
      email: String(formData.get("email")),
      phone: String(formData.get("phone")),
      event_type: String(formData.get("event_type") ?? ""),
      city: String(formData.get("city") ?? ""),
      message: String(formData.get("message")),
      status: "new",
    };

    const { error } = await supabase.from("contact_inquiries").insert(payload);

    if (error) {
      return {
        status: "error",
        message: `Submission failed: ${error.message}`,
      };
    }

    return {
      status: "success",
      message: "Thanks, your message was sent. We will follow up soon.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unexpected error occurred.",
    };
  }
}
