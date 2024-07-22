import Decimal from "decimal.js";
import { err, ok, Result } from "neverthrow";
import { match } from "ts-pattern";

import { Token } from "./tokeniser";

/**
 * Represents an error where the input expression couldn't be evaluated fully.
 * This means that the parser's syntax check isn't comprehensive enough, since
 * a properly formed expression should always collapse.
 */
export type EvalError = { type: "UNCOLLAPSIBLE_EXPR" };

const PI = Decimal.acos(-1);
const E = Decimal.exp(1);

/**
 * Evaluates an array of `Token`s in Reverse Polish Notation into a `Result<Decimal, number> where
 * - `Decimal` is the decimal.js object that was calculated, or
 * - `number` is the last size of the internal calculation stack if the input did not collapse
 *   (i.e. the input couldn't be calculated because it had an error)
 *
 * @example
 * ```typescript
 * const result: Decimal = evaluate([
 * 	{ type: "litr", value: new Decimal(1) },
 * 	{ type: "litr", value: new Decimal(1) },
 * 	{ type: "oper", name: "+" },
 * ]); // => Decimal(2)
 * ```
 */
export default function evaluate(parsedArray: Token[], ans: Decimal, ind: Decimal): Result<Decimal, EvalError> {
	const calcStack: Decimal[] = [];

	for (const token of parsedArray) {
		match(token)
			.with({ type: "lbrk" }, () => null)
			.with({ type: "rbrk" }, () => null)

			.with({ type: "litr" }, token => calcStack.push(token.value))
			.with({ type: "memo", name: "ans" }, () => calcStack.push(ans))
			.with({ type: "memo", name: "ind" }, () => calcStack.push(ind))

			.with({ type: "cons", name: "pi" }, () => calcStack.push(PI))
			.with({ type: "cons", name: "e" }, () => calcStack.push(E))

			.with({ type: "func" }, token => {
				const x = calcStack.pop();
				const f = match(token.name)
					.with("ln", () => Decimal.ln)
					.with("log", () => Decimal.log10)
					.with("sqrt", () => Decimal.sqrt)
					.with("sin", () => Decimal.sin)
					.with("cos", () => Decimal.cos)
					.with("tan", () => Decimal.tan)
					.with("asin", () => Decimal.asin)
					.with("acos", () => Decimal.acos)
					.with("atan", () => Decimal.atan)
					.exhaustive();

				if (x === undefined) return;

				const result = f.call(Decimal, x);

				calcStack.push(result);
			})

			.with({ type: "oper" }, token => {
				const a = calcStack.pop();
				const b = calcStack.pop() ?? new Decimal(0);

				if (a === undefined) return;

				const result = match(token.name)
					.with("+", () => b.plus(a))
					.with("-", () => b.minus(a))
					.with("*", () => b.times(a))
					.with("/", () => b.div(a))
					.with("^", () => b.pow(a))
					.exhaustive();

				calcStack.push(result);
			})
			.exhaustive();
	}

	if (calcStack.length !== 1) return err({ type: "UNCOLLAPSIBLE_EXPR" });

	return ok(calcStack[0]!);
}
