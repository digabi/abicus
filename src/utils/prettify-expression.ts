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
		if (!result.ok) return;

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
	for (let i = 0; i < tokens.length; i++) {
		const lhs = tokens[i - 1];
		const cur = tokens[i]!;

		const shouldHaveSpace =
			lhs &&
			match([lhs, cur])
				.with(
					// No spaces at bracket inside boundaries: "(1 + 1)"
					[P._, { type: "rbrk" }],
					[{ type: "lbrk" }, P._],
					// No space between function name and opening brakcet: "sin(…"
					[{ type: "func" }, { type: "lbrk" }],
					// Disabled: No space on either side of the power operator: "2^5"
					// [P._, { type: "oper", name: "^" }],
					// [{ type: "oper", name: "^" }, P._],
					() => false
				)
				.otherwise(() => true);

		if (shouldHaveSpace) yield " ";

		const formattedToken = match(cur)
			.with({ type: "litr" }, token => token.value.toString().replace(".", ","))
			.with({ type: "lbrk" }, () => "(")
			.with({ type: "rbrk" }, () => ")")
			.with({ type: "memo", name: "ans" }, () => "ANS")
			.with({ type: "memo", name: "ind" }, () => "M")
			.with({ type: "cons", name: "pi" }, () => "π")
			.with({ type: "cons", name: "e" }, () => "e")
			.with({ type: "func", name: "sqrt" }, () => "√")
			.with({ type: "func", name: P.any }, token => token.name)
			.with({ type: "oper", name: "*" }, () => "×")
			.with({ type: "oper", name: "-" }, () => "−")
			.with({ type: "oper", name: P.any }, token => token.name)
			.exhaustive();

		yield formattedToken;
	}
}
