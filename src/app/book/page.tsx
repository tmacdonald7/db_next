import type { Metadata } from "next";
import { BookingForm } from "@/app/book/BookingForm";
import { bandName } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Booking",
    description: `Submit a booking inquiry for ${bandName} with event details, attendance, and budget for venues in Montgomery, Conroe, and Houston.`,
  };
}

export default function BookingPage() {
  return (
    <div className="container">
      <section className="page-header">
        <h1>Book The Decibels</h1>
        <p>Share event details below so we can respond with an accurate availability and pricing proposal.</p>
      </section>
      <section className="section">
        <BookingForm />
      </section>
    </div>
  );
}
