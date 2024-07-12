import Decimal from "decimal.js";
import { match } from "ts-pattern";

import { Token } from "#/calculator/tokeniser";

/**
 * Shorthand for `new Decimal(n)`.
 * @see The decimal.js docs {@link https://mikemcl.github.io/decimal.js/}
 */
export function d(n: Decimal.Value) {
	return new Decimal(n);
}

/**
 * Formats an array of `Token`s into a human-friendly string.
 *
 * @see {@link Token}
 *
 * @example
 * ```ts
 * debugDisplayExpression([
 *   { type: "lit", value: new Decimal(1) },
 *   { type: "op", name: "+" },
 *   { type: "lit", value: new Decimal(1) },
 * ]) // => "[ 1 + 1 ]"
 * ```
 */
export const debugDisplayExpression = (expr: Token[]) => {
	const formatted = expr
		.map(token =>
			match(token)
				.with({ type: "litr" }, t => t.value.toString())
				.with({ type: "lbrk" }, _ => "(")
				.with({ type: "rbrk" }, _ => ")")
				.otherwise(t => t.name)
		)
		.join(" ");

	return `[ ${formatted} ]`;
};
