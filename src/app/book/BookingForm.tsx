"use client";

import { useActionState } from "react";
import {
  initialBookingActionState,
  submitBookingInquiry,
} from "@/app/book/actions";

export function BookingForm() {
  const [state, formAction, isPending] = useActionState(
    submitBookingInquiry,
    initialBookingActionState,
  );

  return (
    <form action={formAction} className="form-grid panel">
      <label>
        Venue Name
        <input name="venue_name" type="text" required />
      </label>

      <label>
        Event Type
        <select name="event_type" required defaultValue="">
          <option value="" disabled>
            Select event type
          </option>
          <option>Country Club Event</option>
          <option>Corporate Event</option>
          <option>Restaurant / Patio</option>
          <option>Private Event</option>
          <option>Other</option>
        </select>
      </label>

      <div className="grid sm:grid-cols-2">
        <label>
          Date
          <input name="date" type="date" required />
        </label>
        <label>
          Start Time
          <input name="start_time" type="time" required />
        </label>
      </div>

      <div className="grid sm:grid-cols-2">
        <label>
          Duration (hours)
          <input name="duration_hours" type="number" min="1" step="0.5" required />
        </label>
        <label>
          Expected Attendance
          <input name="expected_attendance" type="number" min="1" required />
        </label>
      </div>

      <label>
        Location
        <input name="location" type="text" required placeholder="City and venue address or area" />
      </label>

      <label>
        Budget Range
        <select name="budget_range" required defaultValue="">
          <option value="" disabled>
            Select budget range
          </option>
          <option>$1,500 - $2,500</option>
          <option>$2,500 - $4,000</option>
          <option>$4,000 - $6,000</option>
          <option>$6,000+</option>
        </select>
      </label>

      <div className="grid sm:grid-cols-2">
        <label>
          Contact Name
          <input name="contact_name" type="text" required />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" required />
        </label>
      </div>

      <label>
        Email
        <input name="email" type="email" required />
      </label>

      <label>
        Notes
        <textarea name="notes" placeholder="Describe event flow, preferred set style, production notes, and timeline details." />
      </label>

      <button type="submit" className="button-primary" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Booking Inquiry"}
      </button>

      {state.status !== "idle" ? (
        <p className={`status ${state.status}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
