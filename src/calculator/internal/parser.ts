import { isMatching, match, P } from "ts-pattern";
import { Token, TokenId } from "./tokeniser";

/**
 * Parses a iterable of `Token`s into Reverse Polish Notation using the Shunting Yard Algorithm.
 *
 * @example
 * ```typescript
 * const result: Token[] = parse([
 * 	{ type: "lit", value: new Decimal(1) },
 * 	{ type: "op", name: "+" },
 * 	{ type: "lit", value: new Decimal(1) },
 * ]);
 * debugDisplayExpression(result) // => "[ 1 1 + ]"
 * ```
 *
 * @todo Undefined behaviour when given unbalanced round brackets
 *
 * @see Shunting Yard Algorithm: {@link https://en.wikipedia.org/wiki/Shunting_yard_algorithm}
 */
export default function parse(tokens: Token[]) {
	if (!syntaxCheck(tokens)) return;

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
					if (!topmost) return; // TODO: Unbalanced parens
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

	return outputStack;
}

/**
 * A basic syntax check.
 *
 * Iterates over the tokens in the expression and checks rules like "are the brackets balanced"
 * and that all operators have operands.
 *
 * Returns `true` if the input passes and `false` if there is a syntax error somewhere in the input.
 */
function syntaxCheck(tokens: Token[]) {
	// Bracket balance:
	let bracketStackSize = 0;
	for (const token of tokens) {
		bracketStackSize += match(token.type)
			.with("lbrk", () => 1)
			.with("rbrk", () => -1)
			.otherwise(() => 0);

		// All right brackets must have a left bracket somewhere:
		if (bracketStackSize < 0) return false;
	}

	if (bracketStackSize !== 0) return false;

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

		const hasSyntaxError = match(window)
			// Function name must have left bracket on its right side:
			.with([any, func, not(lbrk)], () => true)
			// Operators must have operands on both sides:
			// - The left-hand-side of the operator allows for anything number-like or a right-bracket
			// - The right-hand-side allows for both of the above and a function call
			// - *But* the above doesn't apply with unary minus: there e.g. "3 + (-3)" is allowed
			.with([union(null, lbrk), { type: "oper", name: "-" }, union(numLike, func)], () => false)
			.with([union(null, not(union(numLike, rbrk))), oper, any], () => true)
			.with([any, oper, union(null, not(union(numLike, func, lbrk)))], () => true)
			// Number can only have operator or a bracket on its side:
			// - On the left side, there can be a left-bracket
			// - Conversely on the right side it must be a right-bracket
			.with([not(union(null, oper, lbrk)), numLike, P.any], () => true)
			.with([any, numLike, not(union(oper, rbrk, null))], () => true)
			.otherwise(() => false);

		if (hasSyntaxError) return false;
	}

	return true;
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
