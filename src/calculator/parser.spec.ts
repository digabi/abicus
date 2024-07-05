import { T, t, debugDisplayExpression } from "#/utils/tests";

import { Token } from "./tokeniser";
import parse from "./parser";

const { lit } = T;

describe("Known cases", () => {
	const cases: [Token[], Token[]][] = [
		// Basic cases
		[
			[lit(2), t.plus, lit(3)],
			[lit(2), lit(3), t.plus],
		],
		[
			[lit(2), t.minus, lit(3)],
			[lit(2), lit(3), t.minus],
		],
		[
			[lit(2), t.times, lit(3)],
			[lit(2), lit(3), t.times],
		],
		[
			[lit(2), t.div, lit(3)],
			[lit(2), lit(3), t.div],
		],
		[
			[lit(2), t.pow, lit(3)],
			[lit(2), lit(3), t.pow],
		],

		// Associativity
		[
			[lit(4), t.minus, lit(3), t.minus, lit(2)],
			[lit(4), lit(3), t.minus, lit(2), t.minus],
		],
		[
			[lit(4), t.minus, t.lhs, lit(3), t.minus, lit(2), t.rhs],
			[lit(4), lit(3), lit(2), t.minus, t.minus],
		],
		[
			[lit(4), t.div, lit(3), t.div, lit(2)],
			[lit(4), lit(3), t.div, lit(2), t.div],
		],
		[
			[lit(4), t.div, t.lhs, lit(3), t.div, lit(2), t.rhs],
			[lit(4), lit(3), lit(2), t.div, t.div],
		],
		[
			[lit(4), t.pow, lit(3), t.pow, lit(2)],
			[lit(4), lit(3), lit(2), t.pow, t.pow],
		],
		[
			[t.lhs, lit(4), t.pow, lit(3), t.rhs, t.pow, lit(2)],
			[lit(4), lit(3), t.pow, lit(2), t.pow],
		],

		// Functions
		[
			[t.sin, t.lhs, lit(2), t.plus, lit(3), t.rhs, t.pow, lit(4)],
			[lit(2), lit(3), t.plus, t.sin, lit(4), t.pow],
		],
		[
			[t.cos, t.lhs, lit(2), t.plus, lit(3), t.rhs, t.pow, lit(4)],
			[lit(2), lit(3), t.plus, t.cos, lit(4), t.pow],
		],
		[
			[t.tan, t.lhs, lit(2), t.plus, lit(3), t.rhs, t.pow, lit(4)],
			[lit(2), lit(3), t.plus, t.tan, lit(4), t.pow],
		],
	];

	for (const [input, expected] of cases) {
		const title = `${debugDisplayExpression(input)} => ${debugDisplayExpression(expected)}`;

		const result = debugDisplayExpression(parse(input));
		const wanted = debugDisplayExpression(expected);

		test(title, () => expect(result).toEqual(wanted));
	}
});
