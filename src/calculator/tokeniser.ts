import Decimal from "decimal.js";
import { match } from "ts-pattern";
import { IterableElement } from "type-fest";

type TokenMatcher = (typeof tokenMatchers)[number];
type TokenAny = IterableElement<ReturnType<typeof tokenise>>;

export type TokenId = TokenMatcher[0];
export type Token<T extends TokenId = TokenId> = Extract<TokenAny, { type: T }>;

// prettier-ignore
export const tokenMatchers = [
	["ws",    /^\s+/],
	["lit",   /^((\d+[,.]\d+)|([1-9]\d*)|0)/],
	["op",    /^[-+*/^]/],
	["brak",  /^[()]/],
	["mem",   /^ans/i],
	["fun",   /^(sin|cos|tan|log|ln|sqrt)/i],
	["const", /^(pi|e)/i],
] as const;

/**
 * Reads an input expression and returns a `Generator` of `Token`s.
 *
 * @example
 * ```typescript
 * const result = tokenise("1+1");
 * debugDisplayExpression([...result]) // => "[ 1 + 1 ]"
 * ```
 *
 * @todo Returns early if given unrecognised tokens input
 */
export default function* tokenise(expression: string) {
	const end = expression.length;
	let idx = 0;

	eating: while (idx < end) {
		const slice = expression.slice(idx, end);

		matching: for (const [type, regex] of tokenMatchers) {
			const str = regex.exec(slice)?.[0];

			if (!str) continue matching;

			// prettier-ignore
			const token = match(type)
				.with("ws",    type => ({ type }))
				.with("const", type => ({ type, name: str }))
				.with("mem",   type => ({ type, name: str }))
				.with("fun",   type => ({ type, name: str }))
				.with("lit",   type => ({ type, value: new Decimal(str.replace(",", ".")) }))
                .with("op", type => ({
                    type,
                    name: match(str)
                        .with("-", "+", "/", "*", "^", op => op)
                        .otherwise(() => {
                            throw Error(); // TODO: Programmer error
                        })
                }))
				.with("brak", type => ({
                    type,
                    side: match(str)
                        .with("(", ")", side => side)
                        .otherwise(() => {
                            throw Error(); // TODO: Programmer error
                        })
                }))
				.exhaustive();

			idx += str.length;

			yield token;
			continue eating;
		}

		return; // TODO: User lexical error in input
	}
}
