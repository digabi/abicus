import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

test("Memory-in button forces calculation", async ({ page }) => {
	await page.getByRole("textbox").fill("5*5");
	await page.getByRole("button", { name: "Min" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5");
	expect(page.getByRole("status")).toHaveText("25");
});

test("Memory-in button sets memory", async ({ page }) => {
	await page.getByRole("textbox").fill("5*5");
	await page.getByRole("button", { name: "Min" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5");
	expect(page.getByRole("status")).toHaveText("25");

	await page.getByRole("button", { name: "C", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("");

	await page.getByRole("button", { name: "Mout" }).click();
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("M");
	expect(page.getByRole("status")).toHaveText("25");
});

test("Memory-in button does not re-calculate", async ({ page }) => {
	await page.getByRole("textbox").fill("5*5");
	await page.getByRole("button", { name: "Min" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5");
	expect(page.getByRole("status")).toHaveText("25");

	await page.getByRole("button", { name: "C", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("");

	await page.getByRole("textbox").fill("5*5+M");
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5 + M");
	expect(page.getByRole("status")).toHaveText("50");

	await page.getByRole("button", { name: "Min" }).click();
	await page.getByRole("button", { name: "Min" }).click();
	await page.getByRole("button", { name: "Min" }).click();
	await page.getByRole("button", { name: "Min" }).click();
	await page.getByRole("button", { name: "Min" }).click();

	await page.getByRole("button", { name: "C", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("");

	await page.getByRole("textbox").fill("M");
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("M");
	expect(page.getByRole("status")).toHaveText("50");
});

test("Answer-memory works", async ({ page }) => {
	await page.getByRole("textbox").fill("5*5");
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5");
	expect(page.getByRole("status")).toHaveText("25");

	await page.getByRole("button", { name: "C", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("");

	await page.getByRole("textbox").fill("5*5+");
	await page.getByRole("button", { name: "ANS" }).click();
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5 + ANS");
	expect(page.getByRole("status")).toHaveText("50");

	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5 + ANS");
	expect(page.getByRole("status")).toHaveText("75");

	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5 + ANS");
	expect(page.getByRole("status")).toHaveText("100");
});

test("Memory is cleared from AC", async ({ page }) => {
	await page.getByRole("textbox").fill("5*5");
	await page.getByRole("button", { name: "Min" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("5 × 5");
	expect(page.getByRole("status")).toHaveText("25");

	await page.getByRole("button", { name: "C", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("");

	await page.getByRole("textbox").fill("M + ANS");
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("M + ANS");
	expect(page.getByRole("status")).toHaveText("50");

	await page.getByRole("button", { name: "C", exact: true }).click();
	await page.getByRole("button", { name: "AC", exact: true }).click();

	await page.getByRole("textbox").fill("M + ANS");
	await page.getByRole("button", { name: "=" }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe("M + ANS");
	expect(page.getByRole("status")).toHaveText("0");
});
