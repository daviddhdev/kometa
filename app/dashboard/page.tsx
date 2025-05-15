"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  Clock,
  Library,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [isSending, setIsSending] = useState(false);
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const response = await fetch("/api/user/stats");
      if (!response.ok) throw new Error("Failed to fetch user stats");
      return response.json();
    },
  });

  const handleTestNotification = async () => {
    setIsSending(true);
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to send test notification");
      }
    } catch (error) {
      console.error("Failed to send test notification:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const readingProgressPercentage = stats?.readingProgress.total
    ? (stats.readingProgress.current / stats.readingProgress.total) * 100
    : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestNotification}
          disabled={isSending}
        >
          <Bell className="h-4 w-4 mr-2" />
          {isSending ? "Sending..." : "Test Notification"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volumes</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalVolumes || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalIssues || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Read Issues</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.readIssues || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.totalIssues
                ? `${Math.round(
                    (stats.readIssues / stats.totalIssues) * 100
                  )}% completed`
                : "0% completed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Favorite Volumes
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.favoriteVolumes || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Overall Reading Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(readingProgressPercentage)}%</span>
              </div>
              <Progress value={readingProgressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {stats?.readingProgress.current || 0} pages read out of{" "}
                {stats?.readingProgress.total || 0} total pages
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Publishers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.publisherStats.map((publisher: any) => (
                <div
                  key={publisher.publisher}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{publisher.publisher}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {publisher.count} volumes
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity: any) => (
              <div
                key={activity.issueId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Link
                      href={`/comics/${activity.volumeId}`}
                      className="hover:underline"
                    >
                      {activity.volumeName} #{activity.issueNumber}
                    </Link>
                    {activity.title && (
                      <p className="text-sm text-muted-foreground">
                        {activity.title}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(activity.completedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
