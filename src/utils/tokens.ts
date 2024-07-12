import Decimal from "decimal.js";
import { Token, TokenId } from "#/calculator/tokeniser";

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
} satisfies Record<TokenId, (...args: any[]) => Token>;

/**
 * Utility for creating calculator `Token`s in tests.
 * @see {@link Token}
 */
export const t = {
	pi: T.cons("pi"),
	e: T.cons("e"),
	plus: T.oper("+"),
	minus: T.oper("-"),
	times: T.oper("*"),
	div: T.oper("/"),
	pow: T.oper("^"),
	sin: T.func("sin"),
	cos: T.func("cos"),
	tan: T.func("tan"),
	ln: T.func("ln"),
	sqrt: T.func("sqrt"),
	ans: T.memo("ans"),
	mem: T.memo("mem"),
	lbrk: T.lbrk(),
	rbrk: T.rbrk(),
};
