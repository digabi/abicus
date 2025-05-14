import Decimal from "decimal.js";
import { err, ok, Ok, Result } from "neverthrow";
import { isMatching, match, P, Pattern } from "ts-pattern";

import { AngleUnit } from "..";
import { Token } from "./tokeniser";
Decimal.set({ precision: 500 });
const PI = Decimal.acos(-1);
const E = Decimal.exp(1);
const ONE = new Decimal(1);
const TWO = new Decimal(2);
const RAD_DEG_RATIO = new Decimal(180).div(PI);
const TAN_PRECISION = new Decimal(1).div("1_000_000_000");

export type EvalResult = Result<Decimal, EvalErrorId>;
export type EvalErrorId =
	| "UNEXPECTED_EOF"
	| "UNEXPECTED_TOKEN"
	| "NOT_A_NUMBER"
	| "INFINITY"
	| "NO_LHS_BRACKET"
	| "NO_RHS_BRACKET"
	| "NOT_ENOUGH_ARGS"
	| "TOO_MANY_ARGS"
	| "TRIG_PRECISION";

/**
 * Parses and evaluates a mathematical expression as a list of `Token`s into a `Decimal` value.
 *
 * The returned `Result` is either
 * - The value of the given expression as a `Decimal` object, or
 * - A string representing a syntax error in the input
 *
 */
export default function evaluate(tokens: Token[], ans: Decimal, ind: Decimal, angleUnit: AngleUnit): EvalResult {
	// This function is an otherwise stock-standard Pratt parser but instead
	// of building a full AST as the `left` value, we instead eagerly evaluate
	// the sub-expressions in the `led` parselets.
	//
	// If the above is gibberish to you, it's recommended to read up on Pratt parsing before
	// attempting to change this algorithm. Good explainers are e.g. (WayBackMachine archived):
	// - https://journal.stuffwithstuff.com/2011/03/19/pratt-parsers-expression-parsing-made-easy/ (https://u.ri.fi/1n)
	// - https://martin.janiczek.cz/2023/07/03/demystifying-pratt-parsers.html (https://u.ri.fi/1o)
	// - https://matklad.github.io/2020/04/13/simple-but-powerful-pratt-parsing.html (https://u.ri.fi/1p)
	// - https://abarker.github.io/typped/pratt_parsing_intro.html (https://u.ri.fi/1q)

	let idx = -1; // Incremented by the first `next()` call into the valid index zero

	/** Consumes the next token from the input and returns it */
	function next() {
		return tokens[++idx];
	}

	/** Peeks at the next unconsumed token in the input */
	function peek() {
		return tokens[idx + 1];
	}

	/**
	 * Accepts a `Pattern` for a token and returns it as a `Result`.
	 * - The result is `Ok` with the next token wrapped if the next token matches the pattern.
	 * - The result is `Err` if the next token does not match the pattern.
	 *
	 * Can either just peek at the next token or consume it, based on the value of the second argument.
	 */
	function expect(pattern: Pattern.Pattern<Token>): Result<Token, EvalErrorId> {
		const token = peek();

		if (!token) return err("UNEXPECTED_EOF");
		if (!isMatching(pattern, token)) return err("UNEXPECTED_TOKEN");

		next();

		return ok(token);
	}

	/**
	 * The null denotation of a token.
	 * Also known as the "prefix" or "head" handler.
	 *
	 * Returns the value of a sub-expression without a preceding (i.e. left) expression (i.e. value).
	 */
	function nud(token: Token | undefined): EvalResult {
		return match(token)
			.with(undefined, () => err("UNEXPECTED_EOF" as const))
			.with({ type: "litr" }, token => ok(token.value))
			.with({ type: "cons", name: "pi" }, () => ok(PI))
			.with({ type: "cons", name: "e" }, () => ok(E))
			.with({ type: "memo", name: "ans" }, () => ok(ans))
			.with({ type: "memo", name: "ind" }, () => ok(ind))
			.with({ type: "oper", name: "-" }, () => evalExpr(3).map(right => right.neg()))
			.with({ type: "lbrk" }, () =>
				evalExpr(0).andThen(value =>
					expect({ type: "rbrk" })
						.map(() => value)
						.mapErr(() => "NO_RHS_BRACKET" as const),
				),
			)
			.with({ type: "func" }, token =>
				evalArgs().andThen(args =>
					match(token.name)
						.with("root", () => {
							if (args.length < 1) return err("NOT_ENOUGH_ARGS" as const);
							if (args.length > 2) return err("TOO_MANY_ARGS" as const);

							const radicand = args[0]!;
							const degree = args[1] ?? TWO;

							if (degree.eq(0)) {
								return err("NOT_A_NUMBER" as const);
							}

							return ok(
								radicand.isZero()
									? radicand
									: radicand.lt(0) && degree.isInteger() && !degree.mod(2).eq(0)
										? radicand.neg().pow(ONE.div(degree)).neg()
										: radicand.pow(ONE.div(degree)),
							);
						})
						.otherwise(funcName => {
							if (args.length < 1) return err("NOT_ENOUGH_ARGS" as const);
							if (args.length > 1) return err("TOO_MANY_ARGS" as const);

							const func = Decimal[funcName].bind(Decimal);
							const arg = args[0]!;

							const { any, union } = P;

							return match([angleUnit, funcName])
								.with(["deg", union("sin", "cos")], () => ok(func(degToRad(arg))))
								.with(["deg", union("asin", "acos", "atan")], () => ok(radToDeg(func(arg))))
								.with([any, "tan"], () => {
									const argInRads = angleUnit === "deg" ? degToRad(arg) : arg;

									// Tangent is undefined when the tangent line is parallel to the x-axis,
									// since parallel lines, by definition, don't cross.
									// The tangent is parallel when the argument is $ pi/2 + n × pi $ where
									// $ n $ is an integer. Since we use an approximation for pi, we can only
									// check if the argument is "close enough" to being an integer.
									const coefficient = argInRads.sub(PI.div(2)).div(PI);
									const distFromCriticalPoint = coefficient.sub(coefficient.round()).abs();
									const isArgCritical = distFromCriticalPoint.lt(TAN_PRECISION);

									if (isArgCritical) return err("TRIG_PRECISION" as const);

									return ok(func(argInRads));
								})
								.otherwise(() => ok(func(arg)));
						}),
				),
			)
			.otherwise(() => err("UNEXPECTED_TOKEN"));
	}

	/**
	 * The left denotation of a token.
	 * Also known as the "infix" or "tail" handler.
	 *
	 * Returns the value of a sub-expression with a preceding (i.e. left) expression (i.e. value).
	 */
	function led(token: Token | undefined, left: Ok<Decimal, EvalErrorId>): EvalResult {
		return (
			match(token)
				.with(undefined, () => err("UNEXPECTED_EOF" as const))
				.with({ type: "oper", name: "+" }, () => evalExpr(2).map(right => left.value.add(right)))
				.with({ type: "oper", name: "-" }, () => evalExpr(2).map(right => left.value.sub(right)))
				.with({ type: "oper", name: "*" }, () => evalExpr(3).map(right => left.value.mul(right)))
				.with({ type: "oper", name: "/" }, () => evalExpr(3).map(right => left.value.div(right)))
				.with({ type: "oper", name: "^" }, () => evalExpr(3).map(right => left.value.pow(right)))
				// Right bracket should never get parsed by anything else than the left bracket parselet
				.with({ type: "rbrk" }, () => err("NO_LHS_BRACKET" as const))
				.otherwise(() => err("UNEXPECTED_TOKEN"))
		);
	}

	/**
	 * Tries to read the arguments of a function call to a list of `Decimal`s.
	 */
	function evalArgs(): Result<Decimal[], EvalErrorId> {
		return expect({ type: "lbrk" }).andThen(() => {
			const out: EvalResult[] = [];

			do {
				out.push(evalExpr(0));
			} while (expect({ type: "semi" }).isOk());

			return expect({ type: "rbrk" }).andThen(() => Result.combine(out));
		});
	}

	function evalExpr(rbp: number): EvalResult {
		let left = nud(next());

		while (left.isOk() && peek() && lbp(peek()!) > rbp) {
			left = led(next(), left);
		}

		return left;
	}

	const result = evalExpr(0);

	// After the root eval call there shouldn't be anything to peek at
	if (peek()) {
		return err("UNEXPECTED_TOKEN");
	} else if (result.isErr()) {
		return result;
	} else if (result.value?.isNaN()) {
		return err("NOT_A_NUMBER");
	} else if (!result.value?.isFinite()) {
		return err("INFINITY");
	} else {
		return result;
	}
}

/** Returns the Left Binding Power of the given token */
function lbp(token: Token) {
	return match(token)
		.with({ type: P.union("lbrk", "rbrk", "semi") }, () => 0)
		.with({ type: P.union("litr", "memo", "cons") }, () => 1)
		.with({ type: "oper", name: P.union("+", "-") }, () => 2)
		.with({ type: "oper", name: P.union("*", "/") }, () => 3)
		.with({ type: "oper", name: "^" }, () => 4)
		.with({ type: "func" }, () => 5)
		.exhaustive();
}

/** Converts the argument from degrees to radians */
function degToRad(deg: Decimal) {
	return deg.div(RAD_DEG_RATIO);
}

/** Converts the argument from radians to degrees */
function radToDeg(rad: Decimal) {
	return rad.mul(RAD_DEG_RATIO);
}
