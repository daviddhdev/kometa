import { z } from "zod";

export const env = z
  .object({
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string(),
    VAPID_PRIVATE_KEY: z.string(),
  })
  .parse(process.env);
