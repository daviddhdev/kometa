import { issues, volumes } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

// Database Types
export type Volume = InferSelectModel<typeof volumes> & {
  is_fully_read?: boolean;
};
export type Issue = InferSelectModel<typeof issues>;

// API Response Types
export interface VolumeResponse {
  volume: Volume;
  issues: Issue[];
}

export interface VolumeExistsResponse {
  exists: boolean;
}

export type VolumeIssuesResponse = Issue[];

export interface ErrorResponse {
  error: string;
}

export interface RateLimitError {
  error: string;
  status: number;
  message: string;
  resetTime?: string;
}

// Comic Vine Types
export interface ComicVineImage {
  icon_url: string;
  medium_url: string;
  screen_url: string;
  screen_large_url: string;
  small_url: string;
  super_url: string;
  thumb_url: string;
  tiny_url: string;
  original_url: string;
  image_tags: string;
}

export interface ComicVinePublisher {
  id: number;
  name: string;
  api_detail_url: string;
  site_detail_url: string;
}

export interface ComicVineIssue {
  id: number;
  name: string;
  issue_number: string;
  api_detail_url: string;
  site_detail_url: string;
}

export interface ComicVineVolume {
  aliases: string | null;
  api_detail_url: string;
  character_credits: any[];
  concept_credits: any[];
  count_of_issues: number;
  date_added: string;
  date_last_updated: string;
  deck: string | null;
  description: string | null;
  first_issue: ComicVineIssue;
  id: number;
  image: ComicVineImage;
  last_issue: ComicVineIssue;
  location_credits: any[];
  name: string;
  object_credits: any[];
  person_credits: any[];
  publisher: ComicVinePublisher;
  site_detail_url: string;
  start_year: number;
  team_credits: any[];
}

export interface ComicVineResponse {
  error: string;
  limit: number;
  offset: number;
  number_of_page_results: number;
  number_of_total_results: number;
  status_code: number;
  results: ComicVineVolume[];
  version: string;
}

// Upload Types
export interface ComicFile {
  title: string;
  summary: string;
  issueNumber?: number;
  file?: File;
  isStored?: boolean;
  storedIssueId?: number;
}

// Component Props Types
export interface VolumeSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (b: boolean) => void;
  handleVolumeSelect: (v: ComicVineVolume) => void;
  selectedVolume: ComicVineVolume | null;
  searchResults: ComicVineResponse | null;
  isSearching: boolean;
  searchError: string | null;
}

export interface VolumeInfoCardProps {
  selectedVolume: ComicVineVolume | null;
}

export interface IssueUploaderProps {
  selectedVolume: ComicVineVolume | null;
  uploadedIssues: ComicFile[];
  setUploadedIssues: React.Dispatch<React.SetStateAction<ComicFile[]>>;
  handleSubmit: () => void;
  issueCount: number;
  setIssueCount: React.Dispatch<React.SetStateAction<number>>;
}
