import { debugDisplayExpression } from "#/utils/tests";
import { T, t } from "#/utils/tokens";

import { Token } from "./tokeniser";
import parse from "./parser";

const { litr } = T;

describe("Known cases", () => {
	const cases: [Token[], Token[]][] = [
		// Basic cases
		[
			[litr(2), t.plus, litr(3)],
			[litr(2), litr(3), t.plus],
		],
		[
			[litr(2), t.minus, litr(3)],
			[litr(2), litr(3), t.minus],
		],
		[
			[litr(2), t.times, litr(3)],
			[litr(2), litr(3), t.times],
		],
		[
			[litr(2), t.div, litr(3)],
			[litr(2), litr(3), t.div],
		],
		[
			[litr(2), t.pow, litr(3)],
			[litr(2), litr(3), t.pow],
		],

		// Associativity
		[
			[litr(4), t.minus, litr(3), t.minus, litr(2)],
			[litr(4), litr(3), t.minus, litr(2), t.minus],
		],
		[
			[litr(4), t.minus, t.lbrk, litr(3), t.minus, litr(2), t.rbrk],
			[litr(4), litr(3), litr(2), t.minus, t.minus],
		],
		[
			[litr(4), t.div, litr(3), t.div, litr(2)],
			[litr(4), litr(3), t.div, litr(2), t.div],
		],
		[
			[litr(4), t.div, t.lbrk, litr(3), t.div, litr(2), t.rbrk],
			[litr(4), litr(3), litr(2), t.div, t.div],
		],
		[
			[litr(4), t.pow, litr(3), t.pow, litr(2)],
			[litr(4), litr(3), litr(2), t.pow, t.pow],
		],
		[
			[t.lbrk, litr(4), t.pow, litr(3), t.rbrk, t.pow, litr(2)],
			[litr(4), litr(3), t.pow, litr(2), t.pow],
		],

		// Functions
		[
			[t.sin, t.lbrk, litr(2), t.plus, litr(3), t.rbrk, t.pow, litr(4)],
			[litr(2), litr(3), t.plus, t.sin, litr(4), t.pow],
		],
		[
			[t.cos, t.lbrk, litr(2), t.plus, litr(3), t.rbrk, t.pow, litr(4)],
			[litr(2), litr(3), t.plus, t.cos, litr(4), t.pow],
		],
		[
			[t.tan, t.lbrk, litr(2), t.plus, litr(3), t.rbrk, t.pow, litr(4)],
			[litr(2), litr(3), t.plus, t.tan, litr(4), t.pow],
		],
	];

	for (const [input, expected] of cases) {
		const title = `${debugDisplayExpression(input)} => ${debugDisplayExpression(expected)}`;

		const result = debugDisplayExpression(parse(input));
		const wanted = debugDisplayExpression(expected);

		test(title, () => expect(result).toEqual(wanted));
	}
});
