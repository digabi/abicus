import { match, P } from "ts-pattern";
import { tokenise, Token } from "#/calculator";

/**
 * Takes in an unformatted expression (e.g. `1+2*(cos(2)/sqrt(pi))`) and gives out a "prettified"
 * but equivalent expression (`1 + 2 × (cos(2) / √(π))`).
 *
 * Returns `undefined` if the input expression cannot be tokenised.
 */
export default function prettify(expression: string | Token[]) {
	let tokens: Token[];
	if (typeof expression === "string") {
		const result = tokenise(expression);
		if (result.isErr()) return expression;

		tokens = result.value;
	} else {
		tokens = expression;
	}

	const pretty = Array.from(prettiedCharacters(tokens));

	return pretty.join("");
}

/**
 * Takes in an array of tokens and returns a generator of strings where each string is
 * either a space or a prettified (e.g. `"√"` instead of `"sqrt"`) version of an input token.
 *
 * The strings will be output in the same relative order as they appear in the input token array,
 * meaning that the concatted output of the generator will be an expression that's strictly equivalent
 * to the input token array.
 */
function* prettiedCharacters(tokens: Token[]) {
	const { any, not, union } = P;

	for (let i = 0; i < tokens.length; i++) {
		const lhs = tokens[i - 1] ?? null;
		const cur = tokens[i]!;
		const rhs = tokens[i + 1] ?? null;

		const formattedToken = match(cur)
			.with({ type: "litr" }, token => token.value.toString().replace(".", ","))
			.with({ type: "lbrk" }, () => "(")
			.with({ type: "rbrk" }, () => ")")
			.with({ type: "memo", name: "ans" }, () => "ANS")
			.with({ type: "memo", name: "ind" }, () => "M")
			.with({ type: "cons", name: "pi" }, () => "π")
			.with({ type: "cons", name: "e" }, () => "e")
			.with({ type: "oper", name: "*" }, () => "×")
			.with({ type: "oper", name: "-" }, () => "−")
			.with({ type: "oper", name: any }, token => token.name)
			.with({ type: "func", name: any }, token =>
				match(token.name)
					.with("sqrt", () => "√")
					.with("asin", () => "arcsin")
					.with("acos", () => "arccos")
					.with("atan", () => "arctan")
					.with("log10", () => "log")
					.otherwise(() => token.name)
			)
			.exhaustive();

		yield formattedToken;

		// Decide whether we want a space between the *current* and *left-hand-side* tokens:
		const shouldHaveSpace =
			(lhs || rhs) &&
			match([lhs, cur, rhs])
				.with(
					// No spaces at bracket inside boundaries: "(1 + 1)"
					[any, { type: "lbrk" }, not(null)],
					[any, any, { type: "rbrk" }],
					// No space between function name and opening brakcet: "sin(…"
					[any, { type: "func" }, { type: "lbrk" }],
					// Negative numbers: e.g. "-5" and "-5 + 5" instead of "- 5" and "- 5 + 5"
					[not({ type: union("litr", "cons", "memo", "rbrk") }), { type: "oper", name: "-" }, any],
					// No space at the end
					[any, any, null],
					() => false
				)
				.otherwise(() => true);

		if (shouldHaveSpace) yield " ";
	}
}
