import { ComicVineResponse, ErrorResponse } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request
): Promise<NextResponse<ComicVineResponse | ErrorResponse>> => {
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
      "User-Agent": "ComicApp/1.0", // required by Comic Vine
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch from Comic Vine" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
};
