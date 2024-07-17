import { Err, err, ok, Result } from "neverthrow";
import { isMatching, match, P } from "ts-pattern";

import { Token, TokenId } from "./tokeniser";

/**
 * Represents an error where the parser's syntax check found illegal input.
 * The `idx` field points to the offending token in the input.
 */
// The neverthrow package doesn't export a `ExtractErr` utility yet
export type SyntaxError = Extract<ReturnType<typeof syntaxCheck>, Err<never, any>> extends Err<any, infer T>
	? T
	: never;

/**
 * Parses a iterable of `Token`s into Reverse Polish Notation using the Shunting Yard Algorithm.
 *
 * @example
 * ```typescript
 * const result: Token[] = parse([
 * 	{ type: "litr", value: new Decimal(1) },
 * 	{ type: "oper", name: "+" },
 * 	{ type: "litr", value: new Decimal(1) },
 * ]); // "1 + 1" => "1 1 +"
 * ```
 *
 * @todo Undefined behaviour when given unbalanced round brackets
 *
 * @see Shunting Yard Algorithm: {@link https://en.wikipedia.org/wiki/Shunting_yard_algorithm}
 */
export default function parse(tokens: Token[]): Result<Token[], SyntaxError> {
	const syntaxResult = syntaxCheck(tokens);
	if (syntaxResult.isErr()) return syntaxResult;

	const outputStack: Token[] = []; // Final RPN stack
	const sidingStack: Token[] = []; // AKA the operator stack

	for (const token of tokens) {
		match(token)
			.with({ type: "litr" }, token => outputStack.push(token))
			.with({ type: "memo" }, token => outputStack.push(token))
			.with({ type: "cons" }, token => outputStack.push(token))
			.with({ type: "func" }, token => sidingStack.push(token))
			.with({ type: "lbrk" }, token => sidingStack.push(token))

			.with({ type: "rbrk" }, () => {
				let topmost = sidingStack.at(-1);

				while (!isMatching({ type: "lbrk" satisfies TokenId }, topmost)) {
					if (!topmost) return;
					outputStack.push(topmost);
					sidingStack.pop();
					topmost = sidingStack.at(-1);
				}

				sidingStack.pop();
				topmost = sidingStack.at(-1);

				if (isMatching({ type: "func" satisfies TokenId }, topmost)) {
					outputStack.push(topmost);
					sidingStack.pop();
				}
			})

			.with({ type: "oper" }, token => {
				let topmost = sidingStack.at(-1);

				while (
					topmost &&
					topmost.type === "oper" &&
					(precedence(topmost) > precedence(token) ||
						(precedence(topmost) === precedence(token) && associativity(token) === "lhs"))
				) {
					outputStack.push(topmost);
					sidingStack.pop();
					topmost = sidingStack.at(-1);
				}

				sidingStack.push(token);
			})
			.exhaustive();
	}

	while (sidingStack.length > 0) {
		outputStack.push(sidingStack.pop()!);
	}

	return ok(outputStack);
}

/**
 * A basic syntax check.
 *
 * Iterates over the tokens in the expression and checks rules like "are the brackets balanced"
 * and that all operators have operands.
 *
 */
function syntaxCheck(tokens: Token[]) {
	// --- Bracket balance ---

	let bracketStackSize = 0;
	let startOfUnbalance = 0;
	for (let i = 0; i < tokens.length; i++) {
		bracketStackSize += match(tokens[i]!.type)
			.with("lbrk", () => 1)
			.with("rbrk", () => -1)
			.otherwise(() => 0);

		if (bracketStackSize === 0) startOfUnbalance = i;

		// All right brackets must have a left bracket somewhere:
		if (bracketStackSize < 0)
			return err({
				type: "UNBALANCED_BRAKS" as const,
				idx: startOfUnbalance,
			});
	}

	if (bracketStackSize !== 0)
		return err({
			type: "UNBALANCED_BRAKS" as const,
			idx: startOfUnbalance,
		});

	// --- Basic syntax rules ---

	// Shorthands to avoid writing these over and over:
	const { any, union, not } = P;
	const oper = { type: "oper" satisfies TokenId } as const;
	const func = { type: "func" satisfies TokenId } as const;
	const lbrk = { type: "lbrk" satisfies TokenId } as const;
	const rbrk = { type: "rbrk" satisfies TokenId } as const;
	const litr = { type: "litr" satisfies TokenId } as const;
	const cons = { type: "cons" satisfies TokenId } as const;
	const memo = { type: "memo" satisfies TokenId } as const;

	const numLike = union(litr, cons, memo);

	// Basic syntax rules:
	for (let i = 0; i < tokens.length; i++) {
		const lhs = tokens[i - 1] ?? null;
		const cur = tokens[i]!;
		const rhs = tokens[i + 1] ?? null;

		const window = [lhs, cur, rhs];

		const errorType = match(window)
			// Function name must have left bracket on its right side:
			.with([any, func, not(lbrk)], () => "NO_FUNC_BRAK" as const)
			// Operators must have operands on both sides:
			// - The left-hand-side of the operator allows for anything number-like or a right-bracket
			// - The right-hand-side allows for both of the above and a function call
			// - *But* the above doesn't apply with unary minus: there e.g. "3 + (-3)" is allowed
			.with([union(null, lbrk), { type: "oper", name: "-" }, union(numLike, func)], () => null)
			.with([union(null, not(union(numLike, rbrk))), oper, any], () => "NO_LHS_OPERAND" as const)
			.with([any, oper, union(null, not(union(numLike, func, lbrk)))], () => "NO_RHS_OPERAND" as const)
			// Number can only have operator or a bracket on its side:
			// - On the left side, there can be a left-bracket
			// - Conversely on the right side it must be a right-bracket
			.with([not(union(null, oper, lbrk)), numLike, any], () => "NUM_INVALID_LHS" as const)
			.with([any, numLike, not(union(oper, rbrk, null))], () => "NUM_INVALID_RHS" as const)
			.otherwise(() => null);

		if (errorType) return err({ type: errorType, idx: i });
	}

	return ok(null);
}

function precedence(token: Token<"oper">): number {
	return match(token.name)
		.with("^", () => 2)
		.with("/", "*", () => 1)
		.with("-", "+", () => 0)
		.exhaustive();
}

function associativity(token: Token<"oper">): "lhs" | "rhs" {
	return (
		match(token.name)
			.returnType<"lhs" | "rhs">()
			// Strictly defined:
			.with("^", () => "rhs")
			.with("/", () => "lhs")
			.with("-", () => "lhs")
			// Technically either one:
			.with("+", "*", () => "lhs")
			.exhaustive()
	);
}
