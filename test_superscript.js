import { tokenise } from "./src/calculator/internal/tokeniser.js";
import { evaluate } from "./src/calculator/internal/evaluator.js";
import { prettify } from "./src/utils/prettify-expression.js";

// Test single digit superscripts
console.log("Testing single digit superscripts:");
console.log("2² =", tokenise("2²"));
console.log("3³ =", tokenise("3³"));
console.log("5¹ =", tokenise("5¹"));

// Test multi-digit superscripts
console.log("\nTesting multi-digit superscripts:");
console.log("2¹⁰ =", tokenise("2¹⁰"));
console.log("3⁴⁴ =", tokenise("3⁴⁴"));
console.log("5¹²³ =", tokenise("5¹²³"));

// Test prettification
console.log("\nTesting prettification:");
console.log("2² prettifies to:", prettify("2²"));
console.log("2¹⁰ prettifies to:", prettify("2¹⁰"));
