import { match } from "ts-pattern";
import { Token } from "./tokeniser";
import Decimal from "decimal.js";

const PI = Decimal.acos(-1);
const E = Decimal.exp(1);

/**
 * Evaluates an array of `Token`s in Reverse Polish Notation into a result.
 *
 * @example
 * ```typescript
 * const result: Decimal = evaluate([
 * 	{ type: "lit", value: new Decimal(1) },
 * 	{ type: "lit", value: new Decimal(1) },
 * 	{ type: "op", name: "+" },
 * ]);
 * debugDisplayExpression(result) // => "[ 2 ]"
 * ```
 *
 * @todo Returns `undefined` when evaluating function without an argument
 * @todo Returns `undefined` when input doesn't collapse into a single number
 */
export default function evaluate(parsedArray: Token[], ans: Decimal, mem: Decimal) {
	const calcStack: Decimal[] = [];

	for (const token of parsedArray) {
		match(token)
			.with({ type: "lbrk" }, () => null)
			.with({ type: "rbrk" }, () => null)

			.with({ type: "litr" }, token => calcStack.push(token.value))
			.with({ type: "memo", name: "ans" }, () => calcStack.push(ans))
			.with({ type: "memo", name: "mem" }, () => calcStack.push(mem))

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

	if (calcStack.length !== 1) return;

	return calcStack[0];
}
