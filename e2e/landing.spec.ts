import { expect, test } from "@playwright/test";

test("landing page shows the pitch and the synthetic-data badge", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ClauseCheck/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Contract review AI that cites its sources");
  await expect(page.getByText("Demo build · synthetic data")).toBeVisible();
});
