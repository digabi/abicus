import Decimal from "decimal.js";
import prettify from "#/utils/prettify-expression";
import { T, t } from "#/utils/tokens";

import { Token } from "./tokeniser";
import evaluate from "./evaluator";

const d = (x: number) => new Decimal(x);
const { litr } = T;

function run(title: string, cases: [input: Token[], expected: Decimal][]) {
	describe(title, () => {
		for (const [input, expected] of cases) {
			const title = `"${prettify(input)}" => ${expected.toString()}`;

			const result = evaluate(input, new Decimal(0), new Decimal(0));
			if (result.isErr()) expect.unreachable(`Test case could not be evaluated: ${title} (${result.error})`);

			test(title, () => expect(result.value.toFraction()).toEqual(expected.toFraction()));
		}
	});
}

run("Basic operations", [
	[[litr(1), t.add, litr(1)], d(2)],
	[[litr(1), t.sub, litr(1)], d(0)],
	[[litr(1), t.mul, litr(1)], d(1)],
	[[litr(1), t.div, litr(1)], d(1)],
	[[litr(1), t.pow, litr(1)], d(1)],
]);

run("Associativity", [
	[[litr(4), t.add, litr(3), t.add, litr(2), t.add, litr(1)], d(4).add(3).add(2).add(1)],
	[[litr(4), t.sub, litr(3), t.sub, litr(2), t.sub, litr(1)], d(4).sub(3).sub(2).sub(1)],
	[[litr(4), t.mul, litr(3), t.mul, litr(2), t.mul, litr(1)], d(4).mul(3).mul(2).mul(1)],
	[[litr(4), t.div, litr(3), t.div, litr(2), t.div, litr(1)], d(4).div(3).div(2).div(1)],
	[[litr(4), t.pow, litr(3), t.pow, litr(2), t.pow, litr(1)], d(4).pow(d(3).pow(d(2).pow(1)))],
]);

run("Mixed operators", [
	[[litr(4), t.add, litr(3), t.sub, litr(2), t.add, litr(1)], d(4).add(3).sub(2).add(1)],
	[[litr(4), t.mul, litr(3), t.div, litr(2), t.mul, litr(1)], d(4).mul(3).div(2).mul(1)],
	[
		[litr(9), t.add, litr(8), t.sub, litr(7), t.mul, litr(6), t.div, litr(5), t.pow, litr(4)],
		d(9)
			.add(8)
			.sub(d(7).mul(d(6).div(d(5).pow(4)))),
	],
	[
		[litr(9), t.pow, litr(8), t.div, litr(7), t.mul, litr(6), t.sub, litr(5), t.add, litr(4)],
		d(9).pow(8).div(7).mul(6).sub(5).add(4),
	],
]);

run("Brackets", [
	[[t.lbrk, litr(1), t.rbrk], d(1)],
	[[t.lbrk, litr(1), t.add, litr(1), t.add, litr(1), t.rbrk], d(1).add(1).add(1)],
	[[t.lbrk, litr(1), t.add, t.lbrk, litr(1), t.sub, litr(1), t.rbrk, t.rbrk], d(1).add(d(1).sub(1))],
	[[t.lbrk, t.lbrk, litr(1), t.sub, litr(1), t.rbrk, t.add, litr(1), t.rbrk], d(1).add(d(1).sub(1))],
	[[litr(9), t.div, t.lbrk, litr(8), t.mul, litr(7), t.rbrk, t.div, litr(6)], d(9).div(d(8).mul(7)).div(6)],
]);

run("Negative numbers", [
	[[t.sub, litr(5)], d(-5)],
	[[litr(7), t.add, t.lbrk, t.sub, litr(5), t.rbrk], d(7).plus(-5)],
	[[litr(7), t.add, t.sub, litr(5)], d(7).plus(-5)],
]);

run("Functions", [
	[[t.sin, t.lbrk, litr(10), t.rbrk], d(10).sin()],
	[[t.cos, t.lbrk, litr(10), t.rbrk], d(10).cos()],
	[[t.tan, t.lbrk, litr(10), t.rbrk], d(10).tan()],
	[[t.asin, t.lbrk, litr(0.5), t.rbrk], d(0.5).asin()],
	[[t.acos, t.lbrk, litr(0.5), t.rbrk], d(0.5).acos()],
	[[t.atan, t.lbrk, litr(0.5), t.rbrk], d(0.5).atan()],
]);
