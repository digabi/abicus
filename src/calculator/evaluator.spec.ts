import Decimal from "decimal.js";
import { T, t, d, debugDisplayExpression } from "#/utils/tests";

import { Token } from "./tokeniser";
import evaluate from "./evaluator";

const { lit } = T;

describe("Known cases", () => {
	const cases: [Token[], number | Decimal][] = [
		[[lit(1), lit(1), t.plus], 2],
		[[lit(0.1), lit(0.2), t.plus], d(3).div(10)],
		[[t.pi], d(-1).acos()],
		[[t.e], d(1).exp()],

		// Numbers 64 and 57 chosen by fair dice roll, guaranteed to be random
		[[lit(64), lit(57), t.plus], d(64).add(57)],
		[[lit(64), lit(57), t.minus], d(64).sub(57)],
		[[lit(64), lit(57), t.times], d(64).times(57)],
		[[lit(64), lit(57), t.div], d(64).div(57)],

		// Associativity
		[[lit(4), lit(3), lit(2), t.minus, t.minus], d(4).sub(d(3).sub(2))],
		[[lit(4), lit(3), lit(2), t.div, t.div], d(4).div(d(3).div(2))],
		[[lit(4), lit(3), lit(2), t.pow, t.pow], d(4).pow(d(3).pow(2))],
		[[lit(4), lit(3), t.minus, lit(2), t.minus], d(4).sub(3).sub(2)],
		[[lit(4), lit(3), t.div, lit(2), t.div], d(4).div(3).div(2)],
		[[lit(4), lit(3), t.pow, lit(2), t.pow], d(4).pow(3).pow(2)],

		// Functions
		[[lit(10), t.sin], d(10).sin()],
		[[lit(10), t.cos], d(10).cos()],
		[[lit(10), t.tan], d(10).tan()],

		// Random-ish cases:
		[[t.pi, lit(4), t.div, t.sin, t.pi, lit(4), t.div, t.cos, t.plus], 1.4142135624],
		[[t.e, lit(5), t.pow, t.ln], 5],
		[[lit(16), t.sqrt, lit(27), t.sqrt, t.plus], 9.1961524227],
		[[t.e, lit(10), t.ln, t.pow], 10],
		[[t.e, t.pi, t.pow, t.pi, t.e, t.pow, t.minus], 0.6815349144],
		[[t.pi, lit(4), t.div, t.sin, t.pi, lit(4), t.div, t.cos, t.plus, t.sqrt], 1.189207115],
	];

	for (const [input, expected] of cases) {
		const title = `${debugDisplayExpression(input)} = ${d(expected).toDecimalPlaces(10)}`;

		const result = evaluate(input)?.toDecimalPlaces(10);
		const wanted = d(expected).toDecimalPlaces(10);

		test(title, () => expect(result).toEqual(wanted));
	}
});
