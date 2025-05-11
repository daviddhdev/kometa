"use client";

import type { Issue } from "@/types";

import { QueryClient } from "@tanstack/react-query";

import type { Volume } from "@/types";
import { QueryClientProvider } from "@tanstack/react-query";
import { ComicDetailsPage } from "./comic-details-page";

const queryClient = new QueryClient();

export const ComicDetailsWrapper = ({
  volume,
  issues,
}: {
  volume: Volume;
  issues: Issue[];
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ComicDetailsPage volume={volume} issues={issues} />
    </QueryClientProvider>
  );
};
