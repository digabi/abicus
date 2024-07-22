import Decimal from "decimal.js";

import evaluate from "./internal/evaluator";
import tokenise from "./internal/tokeniser";
import { err, ok } from "neverthrow";

export type { Token, TokenId } from "./internal/tokeniser";

export { tokenise, evaluate };

export function calculate(expression: string, ans: Decimal, ind: Decimal) {
	// This could be a one-liner with neverthrow's `andThen` but we want to
	// jump out of neverthrow-land for React anyhow soon

	const tokens = tokenise(expression);
	if (tokens.isErr()) return err(tokens);

	const result = evaluate(tokens.value, ans, ind);
	if (result.isErr()) return err(tokens);

	return ok(result.value);
}
