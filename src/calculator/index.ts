import Decimal from "decimal.js";

import evaluate from "./evaluator";
import parse from "./parser";
import tokenise from "./tokeniser";

export function calculate(expression: string, ans: Decimal, ind: Decimal) {
	const tokens = tokenise(expression);

	if (!tokens.ok) return new Decimal(0);

	const parsed = parse(tokens.value);
	const result = evaluate(parsed, ans, ind);

	return result;
}
