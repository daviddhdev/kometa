import { z } from "zod";

const envSchema = z.object({
  GOTIFY_URL: z.string().optional(),
  GOTIFY_APP_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
