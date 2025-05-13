"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface UpcomingRelease {
  id: number;
  issue_number: string;
  name: string;
  store_date: string;
  volume: {
    name: string;
    id: number;
  };
}

export function UpcomingReleasesCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data, isLoading, error } = useQuery({
    queryKey: ["upcoming-releases"],
    queryFn: async () => {
      const response = await fetch("/api/upcoming-releases");
      if (!response.ok) {
        throw new Error("Failed to fetch upcoming releases");
      }
      return response.json();
    },
  });

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const releasesByDate =
    data?.results?.reduce(
      (acc: Record<string, UpcomingRelease[]>, release: UpcomingRelease) => {
        const date = release.store_date;
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(release);
        return acc;
      },
      {}
    ) || {};

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };
  console.log(data);
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Failed to load upcoming releases
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Upcoming Releases</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{monthName}</span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            );
            const dateString = formatDate(date);
            const releases = releasesByDate[dateString] || [];

            return (
              <div
                key={day}
                className={`aspect-square p-1 border rounded-md ${
                  releases.length > 0 ? "bg-primary/5" : ""
                }`}
              >
                <div className="text-sm font-medium">{day}</div>
                {releases.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {releases.map((release: UpcomingRelease) => (
                      <div
                        key={release.id}
                        className="text-xs p-1 bg-primary/10 rounded truncate"
                        title={`${release.volume.name} #${release.issue_number}`}
                      >
                        {release.volume.name} #{release.issue_number}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
