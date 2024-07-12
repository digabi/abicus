import Decimal from "decimal.js";
import { d, debugDisplayExpression } from "#/utils/tests";
import { t, T } from "#/utils/tokens";

import { Token } from "./tokeniser";
import evaluate from "./evaluator";

const { litr } = T;

describe("Known cases", () => {
	const cases: [Token[], number | Decimal][] = [
		[[litr(1), litr(1), t.plus], 2],
		[[litr(0.1), litr(0.2), t.plus], d(3).div(10)],
		[[t.pi], d(-1).acos()],
		[[t.e], d(1).exp()],

		// Numbers 64 and 57 chosen by fair dice roll, guaranteed to be random
		[[litr(64), litr(57), t.plus], d(64).add(57)],
		[[litr(64), litr(57), t.minus], d(64).sub(57)],
		[[litr(64), litr(57), t.times], d(64).times(57)],
		[[litr(64), litr(57), t.div], d(64).div(57)],

		// Associativity
		[[litr(4), litr(3), litr(2), t.minus, t.minus], d(4).sub(d(3).sub(2))],
		[[litr(4), litr(3), litr(2), t.div, t.div], d(4).div(d(3).div(2))],
		[[litr(4), litr(3), litr(2), t.pow, t.pow], d(4).pow(d(3).pow(2))],
		[[litr(4), litr(3), t.minus, litr(2), t.minus], d(4).sub(3).sub(2)],
		[[litr(4), litr(3), t.div, litr(2), t.div], d(4).div(3).div(2)],
		[[litr(4), litr(3), t.pow, litr(2), t.pow], d(4).pow(3).pow(2)],

		// Functions
		[[litr(10), t.sin], d(10).sin()],
		[[litr(10), t.cos], d(10).cos()],
		[[litr(10), t.tan], d(10).tan()],

		// Random-ish cases:
		[[t.pi, litr(4), t.div, t.sin, t.pi, litr(4), t.div, t.cos, t.plus], 1.4142135624],
		[[t.e, litr(5), t.pow, t.ln], 5],
		[[litr(16), t.sqrt, litr(27), t.sqrt, t.plus], 9.1961524227],
		[[t.e, litr(10), t.ln, t.pow], 10],
		[[t.e, t.pi, t.pow, t.pi, t.e, t.pow, t.minus], 0.6815349144],
		[[t.pi, litr(4), t.div, t.sin, t.pi, litr(4), t.div, t.cos, t.plus, t.sqrt], 1.189207115],
	];

	for (const [input, expected] of cases) {
		const title = `${debugDisplayExpression(input)} = ${d(expected).toDecimalPlaces(10)}`;

		const result = evaluate(input, d(0), d(0))?.toDecimalPlaces(10);
		const wanted = d(expected).toDecimalPlaces(10);

		test(title, () => expect(result).toEqual(wanted));
	}
});
