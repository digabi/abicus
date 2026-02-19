import Decimal from "decimal.js";
import { formatResult } from "./format-result";
import { calculate, AngleUnit } from "../calculator";

const MAX_SIGNIFICANT_DIGITS = 21;
const NEGATIVE_EXPONENT_LIMIT = 7;

function testCalculate(expression: string, angleUnit: AngleUnit = "rad") {
	const result = calculate(expression, new Decimal(0), new Decimal(0), angleUnit);
	if (result.isErr()) throw new Error(`Calculation failed: ${result.error}`);
	return result.value;
}

// Data-driven test wrapper to simplify test cases
function testResultFormat(
	description: string,
	expression: string,
	expectedFormat: string,
	angleUnit: AngleUnit = "rad",
) {
	it(`${description}: "${expression}" → "${expectedFormat}"`, () => {
		const result = testCalculate(expression, angleUnit);
		expect(formatResult(result)).toBe(expectedFormat);
	});
}

describe("formatResult", () => {
	describe("Regular numbers", () => {
		testResultFormat("formats positive decimal", "123.456", "123,456");
		testResultFormat("formats decimal less than 1", "0.123", "0,123");
	});

	describe("Negative numbers", () => {
		testResultFormat("formats negative decimal", "-123.456", "-123,456");
		testResultFormat("formats negative decimal less than 1", "-0.123", "-0,123");
	});

	describe("Special cases", () => {
		testResultFormat("formats zero", "0", "0");
		testResultFormat("formats negative zero as zero", "-0", "0");
	});

	describe("Significant digits", () => {
		testResultFormat(`truncates to ${MAX_SIGNIFICANT_DIGITS}`, "1.234567890123456789012345", "1,23456789012345678901");
	});

	describe("Large numbers", () => {
		testResultFormat(
			"formats large number in exponential notation",
			"1.23456789012345678901*10^25",
			"1,23456789012345678901e+25",
		);
		testResultFormat(
			"truncates to significant digits limit for large numbers",
			"1.234567890123456789012345678901*10^25",
			"1,23456789012345678901e+25",
		);
	});

	describe("Small numbers", () => {
		testResultFormat(
			"formats very small number in exponential notation",
			"1.23456789012345678901*10^-25",
			"1,23456789012345678901e-25",
		);
		testResultFormat(
			"truncates to significant digits limit for small numbers",
			"1.234567890123456789012345678901*10^-25",
			"1,23456789012345678901e-25",
		);
	});

	describe(`Rounding at significant digits limit (${MAX_SIGNIFICANT_DIGITS})`, () => {
		testResultFormat("rounds down with decimals", `1.${"0".repeat(MAX_SIGNIFICANT_DIGITS - 1)}1`, "1");
		testResultFormat(
			"rounds up with decimals",
			`1.${"1".repeat(MAX_SIGNIFICANT_DIGITS - 1)}5`,
			`1,${"1".repeat(MAX_SIGNIFICANT_DIGITS - 2)}2`,
		);
		testResultFormat(
			"rounds down with large integers",
			`${"1".repeat(MAX_SIGNIFICANT_DIGITS)}1`,
			`1,${"1".repeat(MAX_SIGNIFICANT_DIGITS - 1)}e+${MAX_SIGNIFICANT_DIGITS}`,
		);
		testResultFormat(
			"rounds up large integers",
			`${"1".repeat(MAX_SIGNIFICANT_DIGITS)}5`,
			`1,${"1".repeat(MAX_SIGNIFICANT_DIGITS - 2)}2e+${MAX_SIGNIFICANT_DIGITS}`,
		);
	});

	describe("Exponential notation thresholds", () => {
		testResultFormat(
			`below large threshold (${MAX_SIGNIFICANT_DIGITS}) - no exponentia`,
			`1 * 10 ^ ${MAX_SIGNIFICANT_DIGITS - 1}`,
			`1${"0".repeat(MAX_SIGNIFICANT_DIGITS - 1)}`,
		);
		testResultFormat(
			`at large threshold (${MAX_SIGNIFICANT_DIGITS}) - uses exponential`,
			`1 * 10 ^ ${MAX_SIGNIFICANT_DIGITS}`,
			`1e+${MAX_SIGNIFICANT_DIGITS}`,
		);
		testResultFormat(
			`above small threshold (-${NEGATIVE_EXPONENT_LIMIT}) - no exponential`,
			`1 * 10 ^ -${NEGATIVE_EXPONENT_LIMIT - 1}`,
			`0,${"0".repeat(NEGATIVE_EXPONENT_LIMIT - 2)}1`,
		);
		testResultFormat(
			`at small threshold (-${NEGATIVE_EXPONENT_LIMIT}) - uses exponential`,
			`1 * 10 ^ -${NEGATIVE_EXPONENT_LIMIT}`,
			`1e-${NEGATIVE_EXPONENT_LIMIT}`,
		);
	});

	describe("Trigonometric results", () => {
		testResultFormat("formats sin(π) as exactly zero", "sin(π)", "0");
		testResultFormat("handles high multiples of π", "sin(π*10^100)", "0");
		testResultFormat(`formats sin(π÷2) as exactly one`, `sin(π÷2)`, "1");
		testResultFormat(`formats cos(π÷2) as exactly zero`, `cos(π÷2)`, "0");
		testResultFormat("formats cos(π) as exactly negative one", "cos(π)", "-1");
		testResultFormat(`formats tan(π÷4) as exactly one`, `tan(π÷4)`, "1");
		testResultFormat("respects angle unit", "sin(90)", "1", "deg");
	});
});
