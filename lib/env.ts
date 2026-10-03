import "server-only";
import { z } from "zod";

const bool = z.enum(["true", "false"]).transform((v) => v === "true");

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  LLM_PROVIDER: z.enum(["gemini", "anthropic"]).default("gemini"),
  LLM_MODE: z.enum(["live", "replay"]).default("live"),
  LLM_MODEL: z.string().default("gemini-2.5-flash"),
  LLM_JUDGE_MODEL: z.string().default("gemini-2.5-flash"),
  GEMINI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  EMBEDDING_PROVIDER: z.enum(["gemini", "voyage"]).default("gemini"),
  EMBEDDING_MODEL: z.string().default("gemini-embedding-001"),
  EMBEDDING_DIMS: z.coerce.number().int().default(768),
  VOYAGE_API_KEY: z.string().optional(),

  CRON_SECRET: z.string().optional(),
  DEMO_MODE: bool.default(true),
  DEMO_DAILY_REVIEW_LIMIT: z.coerce.number().int().default(5),
  DEMO_DAILY_QA_LIMIT: z.coerce.number().int().default(40),
  MAX_UPLOAD_MB: z.coerce.number().default(10),
  MAX_PAGES: z.coerce.number().int().default(60),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validated server env. Throws a readable error listing every missing/invalid var. */
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
