import Decimal from "decimal.js";
import { Token, TokenId } from "#/calculator";

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const T = {
	litr: (x: number | Decimal) => ({ type: "litr", value: new Decimal(x) }),
	spow: (x: number | Decimal) => ({ type: "spow", value: new Decimal(x) }),

	oper: (name: Token<"oper">["name"]) => ({ type: "oper", name }),
	memo: (name: Token<"memo">["name"]) => ({ type: "memo", name }),
	func: (name: Token<"func">["name"]) => ({ type: "func", name }),
	cons: (name: Token<"cons">["name"]) => ({ type: "cons", name }),
	lbrk: () => ({ type: "lbrk" }),
	rbrk: () => ({ type: "rbrk" }),
	semi: () => ({ type: "semi" }),
} satisfies Record<TokenId, (...args: any[]) => Token>;

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const t = {
	pi: T.cons("pi"),
	e: T.cons("e"),
	add: T.oper("+"),
	sub: T.oper("-"),
	mul: T.oper("*"),
	div: T.oper("/"),
	pow: T.oper("^"),
	spow0: T.spow(0),
	spow1: T.spow(1),
	spow2: T.spow(2),
	spow3: T.spow(3),
	spow4: T.spow(4),
	spow5: T.spow(5),
	spow6: T.spow(6),
	spow7: T.spow(7),
	spow8: T.spow(8),
	spow9: T.spow(9),
	spow10: T.spow(10),
	spow44: T.spow(44),
	spow123: T.spow(123),
	sin: T.func("sin"),
	cos: T.func("cos"),
	tan: T.func("tan"),
	asin: T.func("asin"),
	acos: T.func("acos"),
	atan: T.func("atan"),
	ln: T.func("ln"),
	log10: T.func("log10"),
	sqrt: T.func("sqrt"),
	root: T.func("root"),
	ans: T.memo("ans"),
	ind: T.memo("ind"),
	lbrk: T.lbrk(),
	rbrk: T.rbrk(),
	semi: T.semi(),
};
