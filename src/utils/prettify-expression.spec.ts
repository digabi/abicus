import prettify from "./prettify-expression";

// Note that the minus and times symbols are written as "-" and "*" here
// but they're actually rendered as "−" and "×" by the prettifier function;
// see the `replaceAll` calls in `run`.

run("Basic spacing rules", [
	["1+(1+1)+(1)", "1 + (1 + 1) + (1)"],
	["1-(1-1)-(1)", "1 - (1 - 1) - (1)"],
	["1+((2+2)+3+(((4))))", "1 + ((2 + 2) + 3 + (((4))))"],
	["sin(1+1)", "sin(1 + 1)"],
	["sin(cos(tan(1+1)))", "sin(cos(tan(1 + 1)))"],
	["sin(cos(1+1)+tan(1+1))", "sin(cos(1 + 1) + tan(1 + 1))"],
	["5^(1+1)", "5 ^ (1 + 1)"],
]);

run("Number literals", [
	["123+321", "123 + 321"],
	["1.00000", "1"],
	["0,10000", "0,1"],
	["123,456", "123,456"],
]);

run("Constants", [
	["123+321", "123 + 321"],
	["1.00000", "1"],
	["0,10000", "0,1"],
	["123,456", "123,456"],
]);

run("Function name rewrites", [
	["sqrt(1)", "√(1)"],
	["sqrt(1 + 2)", "√(1 + 2)"],
]);

run("Negative numbers", [
	["-5", "-5"],
	["-5+5", "-5 + 5"],
	["5+(-5)", "5 + (-5)"],
	["-(5+5)", "-(5 + 5)"],
]);

run("Superscript exponents", [
	["2²", "2²"],
	["3³", "3³"], 
	["5¹", "5¹"],
	["10⁰", "10⁰"],
	["4⁶", "4⁶"],
	["7⁷", "7⁷"],
	["8⁸", "8⁸"],
	["9⁹", "9⁹"],
	// Multi-digit superscripts
	["2¹⁰", "2¹⁰"],
	["3⁴⁴", "3⁴⁴"],
	["5¹²³", "5¹²³"],
	// Should have no space before superscript
	["2 + 3²", "2 + 3²"],
	["(2 + 3)²", "(2 + 3)²"],
	["2 * 3¹⁰", "2 * 3¹⁰"],
]);

run("Factorials", [
	["5!", "5!"],
	["10!", "10!"],
	// Should have no space before factorial
	["2 + 3!", "2 + 3!"],
	["(2 + 3)!", "(2 + 3)!"],
	["2 * 5!", "2 * 5!"],
	["3! + 4!", "3! + 4!"],
]);

describe("Arithmetic character rewrites", () => {
	// Running these in their own block so the names are more descriptive than "5 - 5 => 5 − 5"
	test("Minus", () => expect(prettify("5-5")).toBe("5 − 5"));
	test("Times", () => expect(prettify("5*5")).toBe("5 × 5"));
});

function run(title: string, cases: [string, string][]) {
	describe(title, () => {
		for (const [input, expected] of cases) {
			test(`[ ${input} ] => [ ${expected} ]`, () => {
				const output = prettify(input)?.replaceAll("−", "-").replaceAll("×", "*");
				expect(output).toBe(expected);
			});
		}
	});
}
