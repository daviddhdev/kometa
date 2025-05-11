import { RateLimitError } from "@/types";

export function handleComicVineResponse(response: Response) {
  if (!response.ok) {
    // Check if it's a rate limit error (429 status code)
    if (response.status === 429) {
      const error: RateLimitError = {
        error: "RATE_LIMIT_EXCEEDED",
        status: 429,
        message:
          "ComicVine API rate limit exceeded. Please try again in 1 hour.",
        resetTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      };
      return { error };
    }

    // Handle other errors
    return {
      error: {
        error: "API_ERROR",
        status: response.status,
        message: "Failed to fetch from Comic Vine",
      },
    };
  }

  return { data: response };
}

export function isRateLimitError(error: any): error is RateLimitError {
  return error?.error === "RATE_LIMIT_EXCEEDED";
}
