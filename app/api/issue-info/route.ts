import { handleComicVineResponse } from "@/lib/comicvine-utils";
import { ComicVineResponse, ErrorResponse, RateLimitError } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request
): Promise<
  NextResponse<ComicVineResponse | ErrorResponse | RateLimitError>
> => {
  const { searchParams } = new URL(req.url);
  const issueName = searchParams.get("name");
  const issueNumber = searchParams.get("issue");

  if (!issueName) {
    return NextResponse.json({ error: "Missing issue name" }, { status: 400 });
  }

  const apiKey = process.env.COMIC_VINE_API_KEY;
  const baseUrl = "https://comicvine.gamespot.com/api";

  // Build the query with volume name and optional issue number
  let query = issueName;
  if (issueNumber) {
    query = `${issueName} #${issueNumber}`;
  }

  const url = `${baseUrl}/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(
    query
  )}&resources=issue&field_list=name,deck,description,issue_number,image,volume,cover_date,store_date,date_added,date_last_updated,person_credits,character_credits,team_credits,location_credits,concept_credits,object_credits,story_arc_credits,site_detail_url`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Kometa/1.0", // required by Comic Vine
    },
  });

  const { error, data } = handleComicVineResponse(res);

  if (error) {
    return NextResponse.json(error, { status: error.status });
  }

  const responseData = await data.json();
  return NextResponse.json(responseData);
};
