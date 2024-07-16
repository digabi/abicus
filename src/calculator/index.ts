import Decimal from "decimal.js";

import evaluate from "./internal/evaluator";
import parse from "./internal/parser";
import tokenise from "./internal/tokeniser";

export type { Token, TokenId } from "./internal/tokeniser";
export { tokenise, parse, evaluate };

export function calculate(expression: string, ans: Decimal, ind: Decimal) {
	const tokens = tokenise(expression);

	if (!tokens.ok) return new Decimal(0);

	const parsed = parse(tokens.value);
	if (!parsed) return new Decimal(0);

	const result = evaluate(parsed, ans, ind);

	return result;
}
