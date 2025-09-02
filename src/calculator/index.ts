import Decimal from "decimal.js";
import { err, ok } from "neverthrow";

import evaluate from "./internal/evaluator";
import tokenise from "./internal/tokeniser";

export type { Token, TokenId } from "./internal/tokeniser";
export { tokenise, evaluate };

export type AngleUnit = "deg" | "rad";

export function calculate(expression: string, ans: Decimal, ind: Decimal, angleUnit: AngleUnit) {
	// This could be a one-liner with neverthrow's `andThen` but we want to
	// jump out of neverthrow-land for React anyhow soon

	const tokens = tokenise(expression);
	if (tokens.isErr()) return err(tokens);

	const result = evaluate(tokens.value, ans, ind, angleUnit);
	if (result.isErr()) return err(result);

	return ok(result.value);
}
