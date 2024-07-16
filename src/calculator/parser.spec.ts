import prettify from "#/utils/prettify-expression";
import { T, t } from "#/utils/tokens";

import { Token } from "./tokeniser";
import parse from "./parser";

const { litr } = T;

run("Sanity tests", [
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
]);

run("Associativity", [
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
]);

run("Functions", [
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
]);

function run(title: string, cases: [input: Token[], expected: Token[]][]) {
	describe(title, () => {
		for (const [input, expected] of cases) {
			const title = `${prettify(input)} => ${prettify(expected)}`;

			const result = prettify(parse(input));
			const wanted = prettify(expected);

			test(title, () => expect(result).toEqual(wanted));
		}
	});
}
