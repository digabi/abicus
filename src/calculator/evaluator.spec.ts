import Decimal from "decimal.js";
import { T, d, debugDisplayExpression } from "#/utils/tests";

import { Token } from "./tokeniser";
import evaluate from "./evaluator";

const { lit, op, fun } = T;

const pi = T.const("pi"),
	e = T.const("e"),
	plus = op("+"),
	minus = op("-"),
	times = op("*"),
	div = op("/"),
	pow = op("^"),
	sin = fun("sin"),
	cos = fun("cos"),
	tan = fun("tan"),
	ln = fun("ln"),
	sqrt = fun("sqrt");

describe("Known cases", () => {
	const cases: [Token[], number | Decimal][] = [
		[[lit(1), lit(1), plus], 2],
		[[lit(0.1), lit(0.2), plus], d(3).div(10)],
		[[pi], d(-1).acos()],
		[[e], d(1).exp()],

		// Numbers 64 and 57 chosen by fair dice roll, guaranteed to be random
		[[lit(64), lit(57), plus], d(64).add(57)],
		[[lit(64), lit(57), minus], d(64).sub(57)],
		[[lit(64), lit(57), times], d(64).times(57)],
		[[lit(64), lit(57), div], d(64).div(57)],

		// Associativity
		[[lit(4), lit(3), lit(2), minus, minus], d(4).sub(d(3).sub(2))],
		[[lit(4), lit(3), lit(2), div, div], d(4).div(d(3).div(2))],
		[[lit(4), lit(3), lit(2), pow, pow], d(4).pow(d(3).pow(2))],
		[[lit(4), lit(3), minus, lit(2), minus], d(4).sub(3).sub(2)],
		[[lit(4), lit(3), div, lit(2), div], d(4).div(3).div(2)],
		[[lit(4), lit(3), pow, lit(2), pow], d(4).pow(3).pow(2)],

		// Functions
		[[lit(10), sin], d(10).sin()],
		[[lit(10), cos], d(10).cos()],
		[[lit(10), tan], d(10).tan()],

		// Random-ish cases:
		[[pi, lit(4), div, sin, pi, lit(4), div, cos, plus], 1.4142135624],
		[[e, lit(5), pow, ln], 5],
		[[lit(16), sqrt, lit(27), sqrt, plus], 9.1961524227],
		[[e, lit(10), ln, pow], 10],
		[[e, pi, pow, pi, e, pow, minus], 0.6815349144],
		[[pi, lit(4), div, sin, pi, lit(4), div, cos, plus, sqrt], 1.189207115],
	];

	for (const [input, expected] of cases) {
		const title = `${debugDisplayExpression(input)} = ${d(expected).toDecimalPlaces(10)}`;

		const result = evaluate(input)?.toDecimalPlaces(10);
		const wanted = d(expected).toDecimalPlaces(10);

		test(title, () => expect(result).toEqual(wanted));
	}
});
