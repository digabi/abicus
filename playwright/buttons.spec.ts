import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("Has trigonometric buttons", async ({ page }) => {
	for (const name in ["sin", "cos", "tan", "arcsin", "arccos", "arctan"]) {
		await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
	}
});

test("Has digit buttons", async ({ page }) => {
	for (const name in [..."0123456789"]) {
		await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
	}
});
