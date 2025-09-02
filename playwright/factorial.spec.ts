import { test, expect } from '@playwright/test';

test('factorial button works correctly', async ({ page }) => {
	await page.goto('http://localhost:1420');

	// Check that factorial button is visible
	await expect(page.getByRole('button', { name: '!', exact: true })).toBeVisible();

	// Test simple factorial calculation
	await page.getByRole('button', { name: '5', exact: true }).click();
	await page.getByRole('button', { name: '!', exact: true }).click();
	await page.getByRole('button', { name: '=', exact: true }).click();

	// 5! = 120
	expect(page.getByRole("status")).toHaveText("120");

	// Clear and test another factorial
	await page.getByRole('button', { name: 'C', exact: true }).click();
	await page.getByRole('button', { name: '3', exact: true }).click();
	await page.getByRole('button', { name: '!', exact: true }).click();
	await page.getByRole('button', { name: '=', exact: true }).click();

	// 3! = 6
	expect(page.getByRole("status")).toHaveText("6");
});

test('factorial keyboard input works', async ({ page }) => {
	await page.goto('http://localhost:1420');

	// Focus the input
	await page.locator('input').click();
	
	// Type "4!" and press enter
	await page.keyboard.type('4!');
	await page.keyboard.press('Enter');

	// 4! = 24
	expect(page.getByRole("status")).toHaveText("24");
});
