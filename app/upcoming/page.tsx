"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UpcomingReleasesCalendar } from "@/components/widgets/upcoming-releases-calendar";
import { Info } from "lucide-react";

export default function UpcomingPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">Upcoming Releases</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-4">
              <p className="text-sm">
                This calendar shows upcoming comic releases for the next 30
                days. The data is automatically updated weekly, but you can
                manually refresh it using the refresh button (visible in
                development mode).
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="max-w-4xl mx-auto">
        <UpcomingReleasesCalendar />
      </div>
    </div>
  );
}
