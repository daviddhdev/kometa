"use client";

import { UpcomingReleasesCalendar } from "@/components/widgets/upcoming-releases-calendar";

export default function UpcomingPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Upcoming Releases</h1>
      <div className="max-w-4xl mx-auto">
        <UpcomingReleasesCalendar />
      </div>
    </div>
  );
}
