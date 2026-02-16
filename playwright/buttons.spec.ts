import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/");
});

function expectButtons(title: string, names: string[]) {
	test(title, async ({ page }) => {
		await Promise.all(names.map(name => expect(page.getByRole("button", { name, exact: true })).toBeVisible()));
	});
}

expectButtons("Has trigonometric buttons", ["sin", "cos", "tan", "arcsin", "arccos", "arctan"]);
expectButtons("Has digit buttons", [..."0123456789"]);
expectButtons("Has constant buttons", ["π", "e"]);
expectButtons("Has decimal, operator, and bracket buttons", [...",+−×÷()"]);
expectButtons("Has memory buttons", ["Min", "Mout", "ANS"]);
expectButtons("Has logarithm buttons", ["log", "ln"]);
expectButtons("Has exponent and root buttons", ["x2", "xy", "n√", "√"]);
expectButtons("Has del, clear, and calculate buttons", ["⌫", "AC", "="]);
