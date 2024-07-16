import { isMatching, match } from "ts-pattern";
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
