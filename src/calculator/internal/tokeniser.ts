import Decimal from "decimal.js";
import { err, ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { INPUT_DEBUG } from "#/error-boundary/constants";

/**
 * Represents an error where the tokeniser couldn't match the input to any token.
 * The `idx` field points to the start of the unknown part in the input.
 */
export type LexicalError = { type: "UNKNOWN_TOKEN"; idx: number };

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
 * @see {@link TokenId} for a comprehensive list of the different token types.
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
		// Superscript numbers as exponents: "²", "³", "¹", "⁴⁴", etc.
		// These will be converted to "^2", "^3", "^1", "^44", etc.
		// Multiple superscript digits are treated as a single multi-digit exponent
		/^[⁰¹²³⁴⁵⁶⁷⁸⁹]+/,
		str => {
			const superscriptMap: Record<string, string> = {
				'⁰': '0',
				'¹': '1', 
				'²': '2',
				'³': '3',
				'⁴': '4',
				'⁵': '5',
				'⁶': '6',
				'⁷': '7',
				'⁸': '8',
				'⁹': '9'
			};
			// Convert each superscript character to its regular digit
			const digits = str.split('').map(char => superscriptMap[char] || char).join('');
			return {
				type: "spow" as const,
				value: new Decimal(digits),
			};
		},
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
		// Semicolon: ";"
		/^;/,
		_ => ({ type: "semi" as const }),
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
				/^(root|sqrt|√)/,
			]
				.map(subRegex => subRegex.source)
				.join("|"),
			"i",
		),
		str => ({
			type: "func" as const,
			name: match(str.toLowerCase())
				.with("sqrt", "root", "ln", "sin", "cos", "tan", "asin", "acos", "atan", name => name)
				.with("log", "lg", () => "log10" as const)
				.with("√", () => "root" as const)
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
 * Reads an input expression and returns a `Result<Token[], LexicalError>` where
 * - `Token[]` is the tokenised expression, or
 * - `LexicalError.idx` is the starting index of the *first lexical error* (i.e. unrecognised word) in the input expression.
 *
 * @see {@link Token}
 * @example
 * ```typescript
 * tokenise("1 + 2") // => Ok([{ type: "litr", value: Decimal(1) }, { type: "oper", name: "+" }, ...])
 * tokenise("1 ö 2") // => Err({ type: "UNKNOWN_TOKEN", idx: 2 }) // 2 === "1 ö 2".indexOf("ö")
 * ```
 */
export default function tokenise(expression: string): Result<Token[], LexicalError> {
	return Result.combine([...tokens(expression)]);
}

/**
 * Reads an input expression and returns a `Generator` of `Result<Token, number>` where
 * - `Token` is a token object as built by one of the matchers in {@link tokenMatchers}, or
 * - `number` is the index (of the passed in string) where none of the matchers could be applied,
 *   meaning that there is a lexical error at that point in the input.
 *
 * The generator stops on the first lexical error.
 * I.e. if an error is encountered, it will be the last value output by the generator.
 *
 * @see {@link tokenise}
 * @see {@link Token}
 */
function* tokens(expression: string): Generator<Result<Token, LexicalError>, void, void> {
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
			(window as any)[INPUT_DEBUG] = "tan5sin/ANSsin/tan5sin+(🕺🏼🕺🏼)";
			throw Error("Simulated Error: This is a simulated error for testing purposes.");
		}

		matching: for (const [regex, build] of tokenMatchers) {
			const str = regex.exec(slice)?.[0];

			if (!str) continue matching;

			const token = build(str);

			idx += str.length;

			yield ok(token);
			continue eating;
		}

		yield err({ type: "UNKNOWN_TOKEN", idx });
		return;
	}
}
