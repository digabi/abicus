import Decimal from "decimal.js";
import { match } from "ts-pattern";

/** A tuple of Regex and a token builder function. See {@link tokenMathcers} for details. */
type TokenMatcher = (typeof tokenMatchers)[number];
/** Any of the tokens created by the token builder function in {@link tokenMatchers}. */
type TokenAny = ReturnType<TokenMatcher[1]>;

/**
 * A union of all the possible `Token` `type` values.
 * Automatically computed from `tokenMatchers`.
 * @see {@link tokenMatchers}
 * @see {@link Token}
 */
export type TokenId = ReturnType<TokenMatcher[1]>["type"];

/**
 * A utility type to get the type of a `Token` by type id.
 * @see {@link TokenId}
 * @example
 * ```typescript
 * type ConstantToken = Token<"cons">
 * //   ConstantToken = { type: "cons"; name: "pi" | "e" }
 * type FunctionToken = Token<"func">
 * //   FunctionToken = { type: "func"; name: "sin" | "cos" ... }
 * type LeftBrakToken = Token<"lbrk">
 * //   FunctionToken = { type: "lbrk" }
 * ```
 */
export type Token<T extends TokenId = TokenId> = Extract<TokenAny, { type: T }>;

/**
 * An array of regex & builder function tuples where
 * - The regex detects a token from the input
 * - The builder builds a token object from the slice that the regex detected
 * @see {@link TokenId}
 * @see {@link Token}
 */
const tokenMatchers = [
	// **Notes:**
	// - Each regex should only try to find its token from the beginning of the string.
	// - When adding new types, remember to mark the `type` property `as const` for TypeScript.

	[
		// Unsigned numeric literal: "0", "123", "25.6", etc...
		/^((\d+[,.]\d+)|([1-9]\d*)|0)/,
		str => ({
			type: "litr" as const,
			value: new Decimal(str.replace(",", ".")),
		}),
	],
	[
		// Operators: "-", "+", "/", "*", "^"
		// The multiplication and minus signs have unicode variants that also need to be handled
		/^[-+/*^−×]/,
		str => ({
			type: "oper" as const,
			name: match(str)
				.with("-", "+", "/", "*", "^", op => op)
				.with("−", () => "-" as const)
				.with("×", () => "*" as const)
				.otherwise(op => {
					throw Error(`Programmer error: neglected operator "${op}"`);
				}),
		}),
	],
	[
		// Left bracket: "("
		/^\(/,
		_ => ({ type: "lbrk" as const }),
	],
	[
		// Right bracket: ")"
		/^\)/,
		_ => ({ type: "rbrk" as const }),
	],
	[
		// Constants: "pi", "e", and unicode variations
		/^(pi|π|e|ℇ|𝑒|ℯ)/i,
		str => ({
			type: "cons" as const,
			name: match(str.toLowerCase())
				.with("pi", "e", name => name)
				.with("π", () => "pi" as const)
				.with("ℇ", "𝑒", "ℯ", () => "e" as const)
				.otherwise(name => {
					throw Error(`Programmer error: neglected constant "${name}"`);
				}),
		}),
	],
	[
		// Memory register: "ans" (answer register), "mem" (independent memory register)
		/^(ans|mem|m|ind)/i,
		str => ({
			type: "memo" as const,
			name: match(str.toLowerCase())
				.with("ans", () => "ans" as const)
				.with("m", "ind", "mem", () => "ind" as const)
				.otherwise(name => {
					throw Error(`Programmer error: neglected memory register "${name}"`);
				}),
		}),
	],
	[
		// Function name: "sin", "log", "√", etc...
		new RegExp(
			[
				// TODO: Should we also support the "sin^(-1)" notation for arcus functions?
				// TODO: Should we also support the "sin^(2)(x) == sin(x^2)" notation?
				/^((a(rc)?)?(sin|cos|tan))/,
				/^(log|lg|ln)/,
				/^(sqrt|√)/,
			]
				.map(subRegex => subRegex.source)
				.join("|"),
			"i"
		),
		str => ({
			type: "func" as const,
			name: match(str.toLowerCase())
				.with("sqrt", "log", "ln", "sin", "cos", "tan", "asin", "acos", "atan", name => name)
				.with("√", () => "sqrt" as const)
				.with("lg", () => "log" as const)
				.with("arcsin", () => "asin" as const)
				.with("arccos", () => "acos" as const)
				.with("arctan", () => "atan" as const)
				.otherwise(name => {
					throw Error(`Programmer error: neglected function "${name}"`);
				}),
		}),
	],
] satisfies [RegExp, (str: string) => { type: string }][];

/**
 * Reads an input expression and returns an array of `Token`s as a tagged result.
 *
 * If there's lexical errors in the input, the value of the `error` prop will be the position
 * of the *first* error as an index of the input string.
 *
 * @see {@link Token}
 * @example
 * ```typescript
 * tokenise("1 + 2") // => { ok: true, value: [{ type: "lit", value: Decimal(1) },...] }
 * tokenise("1 ö 2") // => { ok: false, error: 2 } // 2 === "1 ö 2".indexOf("ö")
 * ```
 */
export default function tokenise(expression: string) {
	const output = [...tokens(expression)];
	const errIdx = output.find(result => !result.ok)?.error;
	const hasErr = typeof errIdx !== "undefined";

	return hasErr
		? ({ ok: false, error: errIdx } as const)
		: ({ ok: true, value: output.map(result => result.value as Token) } as const);
}

/**
 * Reads an input expression and returns a `Generator` of `Token`s as tagged results.
 *
 * You probably want to use `tokenise` to get an array of `Token`s instead.
 *
 * @see {@link tokenise}
 * @see {@link Token}
 */
export function* tokens(expression: string) {
	const end = expression.length;
	let idx = 0;

	eating: while (idx < end) {
		const slice = expression.slice(idx, end);

		const whitespace = /^\s+/.exec(slice)?.[0];
		if (whitespace) {
			idx += whitespace.length;
			continue eating;
		}

		if (import.meta.env.DEV && slice.startsWith("improbatur")) {
			throw Error("Simulated error: This is a simulated error for testing purposes");
		}

		matching: for (const [regex, build] of tokenMatchers) {
			const str = regex.exec(slice)?.[0];

			if (!str) continue matching;

			const token = build(str);

			idx += str.length;

			yield { ok: true, value: token } as const;
			continue eating;
		}

		yield { ok: false, error: idx } as const;
		return;
	}
}
