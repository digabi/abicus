import { debugDisplayExpression, d } from "#/utils/tests";
import { T, t } from "#/utils/tokens";
import tokenise, { Token } from "./tokeniser";

const { litr } = T;

run("Whitespace", [
	["2 + 3", [litr(2), t.plus, litr(3)]],
	[" 2 + 3 ", [litr(2), t.plus, litr(3)]],
]);

run("Literals", [
	["1234567890", [litr(1234567890)]],
	["1.234567890", [litr(1.23456789)]],
	["0.1234567890", [litr(0.123456789)]],
	["0.1000000000", [litr(0.1)]],
	["0.0000000000", [litr(0)]],
	["0,0000000000", [litr(0)]],
]);

run("Arbitrary precision", [
	["9007199254740992", [litr(d("9007199254740992"))]],
	["19007199254740992", [litr(d("19007199254740992"))]],
	[
		"0.00000000000000002220446049250313080847263336181640625",
		[litr(d("0.00000000000000002220446049250313080847263336181640625"))],
	],
]);

run("Disregard trailing zeros", [
	["0.1000", [litr(d("0.1"))]],
	[
		"0.000000000000000222044604925031308084726333618164062500000",
		[litr(d("0.0000000000000002220446049250313080847263336181640625"))],
	],
]);

run("Operators", [["2+3", [litr(2), t.plus, litr(3)]]]);
run("Brackets", [["2+(3+4)", [litr(2), t.plus, t.lbrk, litr(3), t.plus, litr(4), t.rbrk]]]);
run("Functions", [["sin cos tan", [t.sin, t.cos, t.tan]]]);
run("Memory", [["ans sin", [t.ans, t.sin]]]);

function run(title: string, cases: [string, Token[]][]) {
	describe(title, () => {
		for (const [input, expected] of cases) {
			const title = `"${input}" => ${debugDisplayExpression(expected)}`;

			const tokens = tokenise(input);

			expect(tokens.ok).toBe(true);
			if (!tokens.value) expect.unreachable("Tokenisation result marked as OK but no token array given from tokeniser");

			const result = debugDisplayExpression(tokens.value);
			const wanted = debugDisplayExpression(expected);

			test(title, () => expect(result).toEqual(wanted));
		}
	});
}
