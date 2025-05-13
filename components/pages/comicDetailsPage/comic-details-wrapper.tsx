"use client";

import type { Issue } from "@/types";

import type { Volume } from "@/types";
import { ComicDetailsPage } from "./comic-details-page";

export const ComicDetailsWrapper = ({
  volume,
  issues,
}: {
  volume: Volume;
  issues: Issue[];
}) => {
  return <ComicDetailsPage volume={volume} issues={issues} />;
};
