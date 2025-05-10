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
  api_detail_url: string;
  id: number;
  name: string;
  site_detail_url: string;
}

export interface ComicVineIssue {
  api_detail_url: string;
  id: number;
  name: string;
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
