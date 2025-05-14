import { handleComicVineResponse } from "@/lib/comicvine-utils";
import { ComicVineResponse, ErrorResponse, RateLimitError } from "@/types";
import { NextResponse } from "next/server";

export const GET = async (
  req: Request
): Promise<
  NextResponse<ComicVineResponse | ErrorResponse | RateLimitError>
> => {
  const { searchParams } = new URL(req.url);
  const volumeName = searchParams.get("name");

  if (!volumeName) {
    return NextResponse.json({ error: "Missing volume name" }, { status: 400 });
  }

  const apiKey = process.env.COMIC_VINE_API_KEY;
  const baseUrl = "https://comicvine.gamespot.com/api";

  const url = `${baseUrl}/volumes/?api_key=${apiKey}&format=json&filter=name:${encodeURIComponent(
    volumeName
  )}&field_list=name,deck,description,first_issue,last_issue,count_of_issues,image,publisher,id,start_year,person_credits,character_credits,location_credits,team_credits,story_arc_credits,concept_credits,aliases,date_added,date_last_updated&sort=date_last_updated:desc`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ComicApp/1.0", // required by Comic Vine
    },
  });

  const { error, data } = handleComicVineResponse(res);

  if (error) {
    return NextResponse.json(error, { status: error.status });
  }

  const responseData = await data.json();
  return NextResponse.json(responseData);
};
