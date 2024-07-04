import { match } from "ts-pattern";
import { Token } from "./tokeniser";
import Decimal from "decimal.js";

const PI = Decimal.acos(-1);
const E = Decimal.exp(1);

/**
 * Evaluates an array of `Token`s in Reverse Polish Notation into a result.
 *
 * @todo Returns `undefined` when evaluating function without an argument
 * @todo Returns `undefined` when input doesn't collapse into a single number
 */
export default function evaluate(parsedArray: Token[]) {
	const calcStack: Decimal[] = [];

	for (const token of parsedArray) {
		match(token)
			.with({ type: "ws" }, () => null)
			.with({ type: "brak" }, () => null)

			.with({ type: "lit" }, token => calcStack.push(token.value))
			.with({ type: "mem", name: "ans" }, () => calcStack.push())
			.with({ type: "const", name: "pi" }, () => calcStack.push(PI))
			.with({ type: "const", name: "e" }, () => calcStack.push(E))

			.with({ type: "fun" }, token => {
				const x = calcStack.pop();
				const f = match(token.name)
					.with("ln", () => Decimal.ln)
					.with("log", () => Decimal.log10)
					.with("sin", () => Decimal.sin)
					.with("cos", () => Decimal.cos)
					.with("tan", () => Decimal.tan)
					.with("sqrt", () => Decimal.sqrt)
					.run();

				if (x === undefined) return;
				if (f === undefined) return;

				const result = f.call(Decimal, x);

				calcStack.push(result);
			})

			.with({ type: "op" }, token => {
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
			.with({ type: "mem", name: "ans" }, () => null)
			.run();
	}

	if (calcStack.length !== 1) return;

	return calcStack[0];
}
