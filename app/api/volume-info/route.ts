export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const volumeName = searchParams.get("name");

  if (!volumeName) {
    return Response.json({ error: "Missing volume name" }, { status: 400 });
  }

  const apiKey = process.env.COMIC_VINE_API_KEY;
  const baseUrl = "https://comicvine.gamespot.com/api";
  const url = `${baseUrl}/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(
    volumeName
  )}&resources=volume&field_list=name,deck,description,first_issue,last_issue,count_of_issues,image,publisher,id`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "ComicApp/1.0", // required by Comic Vine
    },
  });

  if (!res.ok) {
    return Response.json(
      { error: "Failed to fetch from Comic Vine" },
      { status: 500 }
    );
  }

  const data = await res.json();
  return Response.json(data);
};
