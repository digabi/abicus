import { isMatching, match } from "ts-pattern";
import { Token } from "./tokeniser";

function precedence(token: Token<"op">): number {
	return match(token.name)
		.with("^", () => 2)
		.with("/", "*", () => 1)
		.with("-", "+", () => 0)
		.exhaustive();
}

function associativity(token: Token<"op">): "lhs" | "rhs" {
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

/**
 * Parses a iterable of `Token`s into Reverse Polish Notation using the Shunting Yard Algorithm.
 *
 * @todo Undefined behaviour when given unbalanced round brackets
 *
 * @see Shunting Yard Algorithm: {@link https://en.wikipedia.org/wiki/Shunting_yard_algorithm}
 */
export default function parse(tokens: Iterable<Token>) {
	const outputStack: Token[] = []; // Final RPN stack
	const sidingStack: Token[] = []; // AKA the operator stack

	for (const token of tokens) {
		match(token)
			.with({ type: "ws" }, () => null)
			.with({ type: "lit" }, token => outputStack.push(token))
			.with({ type: "mem" }, token => outputStack.push(token))
			.with({ type: "const" }, token => outputStack.push(token))
			.with({ type: "fun" }, token => sidingStack.push(token))

			.with({ type: "brak", side: "(" }, token => sidingStack.push(token))
			.with({ type: "brak", side: ")" }, () => {
				let topmost = sidingStack.at(-1);

				while (!isMatching({ type: "brak", side: "(" }, topmost)) {
					if (!topmost) return; // TODO: Unbalanced parens
					outputStack.push(topmost);
					sidingStack.pop();
					topmost = sidingStack.at(-1);
				}

				sidingStack.pop();
				topmost = sidingStack.at(-1);

				if (isMatching({ type: "fun" }, topmost)) {
					outputStack.push(topmost);
					sidingStack.pop();
				}
			})

			.with({ type: "op" }, token => {
				let topmost = sidingStack.at(-1);

				while (
					topmost &&
					topmost.type === "op" &&
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
