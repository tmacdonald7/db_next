"use client";

import { useActionState } from "react";
import { initialContactActionState, submitContactInquiry } from "@/app/contact/actions";

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    submitContactInquiry,
    initialContactActionState,
  );

  return (
    <form action={formAction} className="form-grid panel">
      <div className="grid sm:grid-cols-2">
        <label>
          Name
          <input name="contact_name" type="text" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
      </div>

      <div className="grid sm:grid-cols-2">
        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>
        <label>
          Event Type
          <input name="event_type" type="text" placeholder="Corporate, private event, venue night, etc." />
        </label>
      </div>

      <label>
        City
        <input name="city" type="text" placeholder="Montgomery, Conroe, Houston, etc." />
      </label>

      <label>
        Message
        <textarea
          name="message"
          required
          placeholder="Tell us about your date, venue, and what kind of set you need."
        />
      </label>

      <button type="submit" className="button-primary" disabled={isPending}>
        {isPending ? "Sending..." : "Send Message"}
      </button>

      {state.status !== "idle" ? (
        <p className={`status ${state.status}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
