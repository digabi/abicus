import Decimal from "decimal.js";
import { Token, TokenId } from "#/calculator/tokeniser";
import { match } from "ts-pattern";

/**
 * Shorthand for `new Decimal(n)`.
 * @see The decimal.js docs {@link https://mikemcl.github.io/decimal.js/}
 */
export function d(n: Decimal.Value) {
	return new Decimal(n);
}

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const T = {
	ws: () => ({ type: "ws" }),
	lit: (x: number | Decimal) => ({ type: "lit", value: d(x) }),

	op: (name: Token<"op">["name"]) => ({ type: "op", name }),
	mem: (name: Token<"mem">["name"]) => ({ type: "mem", name }),
	fun: (name: Token<"fun">["name"]) => ({ type: "fun", name }),
	const: (name: Token<"const">["name"]) => ({ type: "const", name }),
	brak: (side: Token<"brak">["side"]) => ({ type: "brak", side }),
} satisfies Record<TokenId, (...args: any[]) => Token>;

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const t = {
	ws: T.ws(),
	pi: T.const("pi"),
	e: T.const("e"),
	plus: T.op("+"),
	minus: T.op("-"),
	times: T.op("*"),
	div: T.op("/"),
	pow: T.op("^"),
	sin: T.fun("sin"),
	cos: T.fun("cos"),
	tan: T.fun("tan"),
	ln: T.fun("ln"),
	sqrt: T.fun("sqrt"),
	mem: T.mem("ans"),
	lhs: T.brak("("),
	rhs: T.brak(")"),
};

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
				.with({ type: "ws" }, () => "_")
				.with({ type: "lit" }, t => t.value.toString())
				.with({ type: "brak" }, t => t.side)
				.otherwise(t => t.name)
		)
		.join(" ");

	return `[ ${formatted} ]`;
};
