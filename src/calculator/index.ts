import Decimal from "decimal.js";
import { err, Result } from "neverthrow";

import evaluate, { EvalError } from "./internal/evaluator";
import parse, { SyntaxError } from "./internal/parser";
import tokenise, { LexicalError } from "./internal/tokeniser";

export type { Token, TokenId } from "./internal/tokeniser";
export type CalculationError = LexicalError | SyntaxError | EvalError;

export { tokenise, parse, evaluate };

export function calculate(expression: string, ans: Decimal, ind: Decimal): Result<Decimal, CalculationError> {
	const tokens = tokenise(expression);
	if (tokens.isErr()) return err(tokens.error);

	const parsed = parse(tokens.value);
	if (parsed.isErr()) return err(parsed.error);

	return evaluate(parsed.value, ans, ind);
}
