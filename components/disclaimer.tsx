export const DISCLAIMER = "First-pass review aid. Not legal advice. Attorney review required.";

export function DisclaimerFooter() {
  return (
    <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
      {DISCLAIMER} <span aria-hidden>·</span> Demo build with synthetic data.
    </footer>
  );
}
