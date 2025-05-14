"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPlaceholder } from "@/components/ui/loading-placeholder";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

interface UpcomingRelease {
  id: number;
  issue_number: string;
  name: string;
  store_date: string;
  cover_image: string;
  volume: {
    name: string;
    id: number;
  };
}

interface WeekGroup {
  startDate: Date;
  endDate: Date;
  releases: UpcomingRelease[];
}

export function UpcomingReleasesCalendar() {
  const queryClient = useQueryClient();
  const isDevelopment = process.env.NODE_ENV === "development";

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

  const handleRefresh = async () => {
    try {
      const response = await fetch("/api/upcoming-releases/update", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to update releases");
      }
      await queryClient.invalidateQueries({ queryKey: ["upcoming-releases"] });
    } catch (error) {
      console.error("Error refreshing releases:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const formatWeekRange = (startDate: Date, endDate: Date) => {
    const formatOptions: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
    };
    return `${startDate.toLocaleDateString(
      "en-US",
      formatOptions
    )} - ${endDate.toLocaleDateString("en-US", formatOptions)}`;
  };

  const groupReleasesByWeek = (releases: UpcomingRelease[]): WeekGroup[] => {
    const groups: WeekGroup[] = [];
    let currentGroup: WeekGroup | null = null;

    releases.forEach((release) => {
      const releaseDate = new Date(release.store_date);
      const weekStart = new Date(releaseDate);
      weekStart.setDate(releaseDate.getDate() - releaseDate.getDay()); // Start of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

      if (!currentGroup || releaseDate > currentGroup.endDate) {
        currentGroup = {
          startDate: weekStart,
          endDate: weekEnd,
          releases: [],
        };
        groups.push(currentGroup);
      }
      currentGroup.releases.push(release);
    });

    return groups;
  };

  const releases = data?.results || [];
  const weekGroups = groupReleasesByWeek(releases);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Releases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center">
            <LoadingPlaceholder text="Loading upcoming releases..." />
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
        {isDevelopment && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh releases data"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {weekGroups.map((group, index) => (
            <div key={group.startDate.toISOString()} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <h3 className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {formatWeekRange(group.startDate, group.endDate)}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-4">
                {group.releases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative w-24 h-36 flex-shrink-0">
                      {release.cover_image ? (
                        <Image
                          src={release.cover_image}
                          alt={`${release.volume.name} #${release.issue_number} cover`}
                          fill
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            No cover
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-muted-foreground">
                        {formatDate(release.store_date)}
                      </div>
                      <h3 className="font-semibold truncate">
                        {release.volume.name} #{release.issue_number}
                      </h3>
                      {release.name && (
                        <p className="text-sm text-muted-foreground truncate">
                          {release.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
