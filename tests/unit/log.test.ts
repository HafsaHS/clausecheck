import { afterEach, describe, expect, it, vi } from "vitest";
import { __test, log } from "@/lib/log";

const { redact } = __test;

describe("redact", () => {
  it("redacts contract-text fields at any depth", () => {
    const out = redact({
      contractId: "c1",
      question: "What is the liability cap?",
      nested: { clauses: [{ id: "k1", text: "Fees paid in the prior month." }] },
    });
    expect(out).toEqual({
      contractId: "c1",
      question: "[redacted]",
      nested: { clauses: [{ id: "k1", text: "[redacted]" }] },
    });
  });

  it("matches key names case-insensitively", () => {
    expect(redact({ Answer: "x", QUOTED_TEXT: "y", Prompt: "z" })).toEqual({
      Answer: "[redacted]",
      QUOTED_TEXT: "[redacted]",
      Prompt: "[redacted]",
    });
  });

  it("leaves primitives and non-sensitive keys unchanged", () => {
    expect(redact("plain")).toBe("plain");
    expect(redact(null)).toBe(null);
    expect(redact({ tokens: 120, model: "gemini-2.5-flash" })).toEqual({ tokens: 120, model: "gemini-2.5-flash" });
  });
});

describe("log", () => {
  afterEach(() => vi.restoreAllMocks());

  it("writes one JSON line without the redacted values", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    log.info("qa.answered", { contractId: "c1", answer: "secret clause text" });
    const line = JSON.parse(spy.mock.calls[0][0] as string);
    expect(line).toMatchObject({ level: "info", event: "qa.answered", contractId: "c1", answer: "[redacted]" });
    expect(spy.mock.calls[0][0]).not.toContain("secret clause text");
  });

  it("routes errors to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    log.error("pipeline.failed", { code: "SCANNED_PDF" });
    expect(spy).toHaveBeenCalledOnce();
  });
});
