import { test, expect, Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

async function selectRange(page: Page, lhs: number, rhs: number) {
	const handle = page.getByRole("textbox");
	await handle.focus();
	await handle.evaluate(
		(el: HTMLInputElement, { lhs, rhs }) => {
			el.setSelectionRange(lhs, rhs);
		},
		{ lhs, rhs },
	);
}

/*****************************************************************************/

test("Can wrap in brackets", async ({ page }) => {
	await page.getByRole("textbox").fill("5+5/2");
	await selectRange(page, 0, 3);
	await page.keyboard.press("(");
	expect(await page.getByRole("textbox").inputValue()).toBe("(5+5)/2");
});

/*****************************************************************************/

function operator(keyboard: string, render = keyboard) {
	test(`Shortcut for "${render}" works (keyboard)`, async ({ page }) => {
		await page.getByRole("textbox").fill("5+5");
		await selectRange(page, 0, 3);
		await page.keyboard.press(keyboard);
		expect(await page.getByRole("textbox").inputValue()).toBe(`(5+5) ${render} ()`);
	});
	test(`Shortcut for "${render}" works (on-screen keypad)`, async ({ page }) => {
		await page.getByRole("textbox").fill("5+5");
		await selectRange(page, 0, 3);
		await page.getByRole("button", { name: render, exact: true }).click();
		expect(await page.getByRole("textbox").inputValue()).toBe(`(5+5) ${render} ()`);
	});
}

operator("+");
operator("/");
operator("*", "×");
operator("-", "−");

/*****************************************************************************/

test(`Shortcut for "^" works (keyboard)`, async ({ page }) => {
	await page.getByRole("textbox").fill("5+5");
	await selectRange(page, 0, 3);
	await page.keyboard.press("^");
	expect(await page.getByRole("textbox").inputValue()).toBe(`(5+5) ^ ()`);
});

test(`Shortcut for "^" works (on-screen keypad)`, async ({ page }) => {
	await page.getByRole("textbox").fill("5+5");
	await selectRange(page, 0, 3);
	await page.getByRole("button", { name: "xy", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe(`(5+5) ^ ()`);
});

test(`Shortcut for "^2" works (on-screen keypad)`, async ({ page }) => {
	await page.getByRole("textbox").fill("5+5");
	await selectRange(page, 0, 3);
	await page.getByRole("button", { name: "x2", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe(`(5+5) ^ 2`);
});

test(`Shortcut for "ⁿ√" works (on-screen keypad)`, async ({ page }) => {
	await page.getByRole("textbox").fill("5+5");
	await selectRange(page, 0, 3);
	await page.getByRole("button", { name: "n√", exact: true }).click();
	expect(await page.getByRole("textbox").inputValue()).toBe(`√(5+5 ; )`);
});

/*****************************************************************************/

function func(name: string) {
	test(`Function "${name}" works`, async ({ page }) => {
		await page.getByRole("textbox").fill("5+5");
		await selectRange(page, 0, 3);
		await page.getByRole("button", { name, exact: true }).click();
		expect(await page.getByRole("textbox").inputValue()).toBe(`${name}(5+5)`);
	});
}

["sin", "cos", "tan", "arcsin", "arccos", "arctan", "log", "ln", "√"].forEach(func);

/*****************************************************************************/
