import Decimal from "decimal.js";
import { Token, TokenId } from "#/calculator";

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const T = {
	litr: (x: number | Decimal) => ({ type: "litr", value: new Decimal(x) }),

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
	sin: T.func("sin"),
	cos: T.func("cos"),
	tan: T.func("tan"),
	asin: T.func("asin"),
	acos: T.func("acos"),
	atan: T.func("atan"),
	ln: T.func("ln"),
	log10: T.func("log10"),
	sqrt: T.func("sqrt"),
	ans: T.memo("ans"),
	ind: T.memo("ind"),
	lbrk: T.lbrk(),
	rbrk: T.rbrk(),
};
