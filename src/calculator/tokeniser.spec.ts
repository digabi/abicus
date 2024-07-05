import { T, t, debugDisplayExpression, d } from "#/utils/tests";
import tokenise, { Token } from "./tokeniser";

const { lit } = T;

describe("Known cases", () => {
	const cases: [string, Token[]][] = [
		["2 + 3", [lit(2), t.ws, t.plus, t.ws, lit(3)]],
		[" 2 + 3 ", [t.ws, lit(2), t.ws, t.plus, t.ws, lit(3), t.ws]],
		["1234567890", [lit(1234567890)]],
		["1.234567890", [lit(1.23456789)]],
		["0.1234567890", [lit(0.123456789)]],
		["0.1000000000", [lit(0.1)]],
		["0.0000000000", [lit(0)]],
		["0,0000000000", [lit(0)]],
		["9007199254740992", [lit(d("9007199254740992"))]],
		["19007199254740992", [lit(d("19007199254740992"))]],

		[
			"0.00000000000000022204460492503130808472633361816406250",
			[lit(d("0.0000000000000002220446049250313080847263336181640625"))],
		],
		[
			"0.00000000000000002220446049250313080847263336181640625",
			[lit(d("0.00000000000000002220446049250313080847263336181640625"))],
		],

		["2+3", [lit(2), t.plus, lit(3)]],
		["2+(3+4)", [lit(2), t.plus, t.lhs, lit(3), t.plus, lit(4), t.rhs]],
		["sin cos tan", [t.sin, t.ws, t.cos, t.ws, t.tan]],
		["ans sin", [t.mem, t.ws, t.sin]],
	];

	for (const [input, expected] of cases) {
		const title = `"${input}" => ${debugDisplayExpression(expected)}`;

		const result = debugDisplayExpression([...tokenise(input)]);
		const wanted = debugDisplayExpression(expected);

		test(title, () => expect(result).toEqual(wanted));
	}
});
