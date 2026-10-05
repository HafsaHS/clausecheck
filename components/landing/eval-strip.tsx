import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Only the fields the strip shows; numbers always come from the latest published test-split run (never hardcoded).
const metricsSchema = z.object({
  extraction: z.object({ f1: z.number() }),
  qa: z.object({ citation_precision: z.number(), abstention_accuracy: z.number(), n: z.number() }),
});

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export async function EvalStrip() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("eval_runs")
    .select("metrics, created_at")
    .eq("split", "test")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const parsed = metricsSchema.safeParse(data?.metrics);
  if (!parsed.success) return null; // No run yet (or a shape we can't read): hide the strip, per spec §13.

  const m = parsed.data;
  const stats = [
    { label: "Clause extraction F1", value: pct(m.extraction.f1) },
    { label: "Citation precision", value: pct(m.qa.citation_precision) },
    { label: "Correct “I don’t know”", value: pct(m.qa.abstention_accuracy) },
  ];

  return (
    <section aria-label="Evaluation results" className="mx-auto w-full max-w-4xl px-4">
      <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-card px-6 py-5 text-center">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className="mt-1 font-heading text-3xl font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Held-out synthetic test set, {m.qa.n} questions.{" "}
        <Link href="/evals" className="underline underline-offset-4 hover:text-foreground">
          How it&apos;s measured
        </Link>
      </p>
    </section>
  );
}
