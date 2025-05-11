import { ComicVineResponse, ErrorResponse } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request
): Promise<NextResponse<ComicVineResponse | ErrorResponse>> => {
  const { searchParams } = new URL(req.url);
  const volumeName = searchParams.get("name");

  if (!volumeName) {
    return NextResponse.json({ error: "Missing volume name" }, { status: 400 });
  }

  const apiKey = process.env.COMIC_VINE_API_KEY;
  const baseUrl = "https://comicvine.gamespot.com/api";
  const url = `${baseUrl}/volumes/?api_key=${apiKey}&format=json&filter=name:${encodeURIComponent(
    volumeName
  )}&field_list=name,deck,description,first_issue,last_issue,count_of_issues,image,publisher,id,start_year,person_credits,character_credits,location_credits,team_credits,story_arc_credits,concept_credits,aliases,date_added,date_last_updated`;

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
