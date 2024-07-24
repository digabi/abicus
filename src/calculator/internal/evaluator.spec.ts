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

function fail(title: string, cases: Token[][]) {
	describe(title, () => {
		for (const input of cases) {
			const title = `"${prettify(input)}"`;

			const result = evaluate(input, new Decimal(0), new Decimal(0));
			test(title, () => expect(result.isErr()).toBe(true));
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
	[[t.lbrk, t.lbrk, t.lbrk, t.lbrk, litr(1), t.rbrk, t.rbrk, t.rbrk, t.rbrk, t.mul, litr(2)], d(2)],
]);

run("Negative numbers", [
	[[t.sub, litr(5)], d(-5)],
	[[t.sub, litr(5), t.mul, litr(5)], d(-25)],
	[[t.sub, t.lbrk, litr(5), t.mul, litr(5), t.rbrk], d(-25)],
	[[litr(7), t.add, t.lbrk, t.sub, litr(5), t.rbrk], d(7).plus(-5)],
	[[litr(7), t.add, t.sub, litr(5)], d(7).plus(-5)],
]);

//prettier-ignore
run("Functions", [
	[[t.sin,   t.lbrk, litr(10),  t.rbrk], d(10).sin()],
	[[t.cos,   t.lbrk, litr(10),  t.rbrk], d(10).cos()],
	[[t.tan,   t.lbrk, litr(10),  t.rbrk], d(10).tan()],
	[[t.asin,  t.lbrk, litr(0.5), t.rbrk], d(0.5).asin()],
	[[t.acos,  t.lbrk, litr(0.5), t.rbrk], d(0.5).acos()],
	[[t.atan,  t.lbrk, litr(0.5), t.rbrk], d(0.5).atan()],
	[[t.ln,    t.lbrk, litr(10),  t.rbrk], d(10).ln()],
	[[t.log10, t.lbrk, litr(13),  t.rbrk], Decimal.log10(13)],
	[[t.sqrt,  t.lbrk, litr(13),  t.rbrk], Decimal.sqrt(13)],

	[[t.sin,   t.lbrk, litr(13),  t.add, litr(13),  t.rbrk], d(2 * 13).sin()],
	[[t.cos,   t.lbrk, litr(13),  t.add, litr(13),  t.rbrk], d(2 * 13).cos()],
	[[t.tan,   t.lbrk, litr(13),  t.add, litr(13),  t.rbrk], d(2 * 13).tan()],
	[[t.asin,  t.lbrk, litr(0.5), t.add, litr(0.5), t.rbrk], d(2 * 0.5).asin()],
	[[t.acos,  t.lbrk, litr(0.2), t.add, litr(0.2), t.rbrk], d(2 * 0.2).acos()],
	[[t.atan,  t.lbrk, litr(0.5), t.add, litr(0.5), t.rbrk], d(2 * 0.5).atan()],
	[[t.ln,    t.lbrk, litr(10),  t.add, litr(10),  t.rbrk], d(2 * 10).ln()],
	[[t.log10, t.lbrk, litr(13),  t.add, litr(13),  t.rbrk], Decimal.log10(2 * 13)],
	[[t.sqrt,  t.lbrk, litr(13),  t.add, litr(13),  t.rbrk], Decimal.sqrt(2 * 13)],
]);

describe("Constants", () => {
	test("π is defined", () => {
		const result = evaluate([T.cons("pi")], d(0), d(0));
		if (result.isErr()) expect.unreachable(`Could not evaluate value of pi: (${result.error})`);
		expect(result.value.toNumber()).toBeCloseTo(103993 / 33102, 8);
	});
	test("e is defined", () => {
		const result = evaluate([T.cons("e")], d(0), d(0));
		if (result.isErr()) expect.unreachable(`Could not evaluate value of Napier's constant: (${result.error})`);
		expect(result.value.toNumber()).toBeCloseTo(49171 / 18089, 8);
	});
	test("Can be used in expressions", () => {
		const result = evaluate([T.cons("e"), t.div, T.cons("pi")], d(0), d(0));
		if (result.isErr()) expect.unreachable(`Could not use constants in expression: (${result.error})`);
		expect(result.value.toNumber()).toBeCloseTo(53035 / 61294, 8);
	});
});

describe("Memory registers", () => {
	test("Answer register is used", () => {
		const result = evaluate([t.ans], d(100), d(0));
		if (result.isErr()) expect.unreachable(`Could not use the answer register: (${result.error})`);
		expect(result.value.toNumber()).toEqual(100);
	});
	test("Independent register is used", () => {
		const result = evaluate([t.ind], d(0), d(100));
		if (result.isErr()) expect.unreachable(`Could not use the independent register: (${result.error})`);
		expect(result.value.toNumber()).toEqual(100);
	});
	test("Can be used in expressions", () => {
		const result = evaluate([t.ind, t.div, t.ans], d(712), d(108));
		if (result.isErr()) expect.unreachable(`Could not use the memory registers in expression: (${result.error})`);
		expect(result.value.toNumber()).toEqual(108 / 712);
	});
});

describe("Syntax Errors", () => {
	fail("Arithmetic", [
		[litr(10), t.add, t.add, litr(10)],
		[litr(10), t.mul, t.mul, litr(10)],
		[litr(10), t.div, t.div, litr(10)],
		[litr(10), t.pow, t.pow, litr(10)],

		[t.add, litr(10)],
		[t.mul, litr(10)],
		[t.div, litr(10)],
		[t.pow, litr(10)],

		[litr(10), t.add],
		[litr(10), t.sub],
		[litr(10), t.mul],
		[litr(10), t.div],
		[litr(10), t.pow],

		[litr(10), litr(10)],
		[litr(10), t.lbrk, litr(10), t.add, litr(10), t.rbrk],
		[t.lbrk, litr(10), t.add, litr(10), t.rbrk, litr(10)],
	]);

	fail("Functions", [
		[t.sin, litr(10)],
		[t.sin, t.sin, t.lbrk, litr(10), t.rbrk],
		[t.sin, t.lbrk, t.sin, t.lbrk, litr(10), t.rbrk],
	]);
});
