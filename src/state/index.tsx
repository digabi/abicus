import Decimal from "decimal.js";
import { createContext, PropsWithChildren, useContext } from "react";
import { calculate } from "#/calculator";

import useBuffer, { BufferHandle } from "./internal-buffer";
import useMemory, { MemoryHandle } from "./internal-memory";

type CalculatorContext = {
	/** Handle to the calculator's input buffer */
	buffer: BufferHandle;
	/** Handle to the calculator's memory registers */
	memory: MemoryHandle;

	/** Clear the input buffer and all memory registers */
	clearAll(): void;

	/**
	 * Crunch the numbers!
	 *
	 * - Evaluates the expression in the input buffer.
	 * - Stores the result in the answer memory register.
	 * - Marks the input buffer as "clean" to signal that *the current answer matches the value of the input buffer*.
	 *
	 * @param `saveToInd` Whether the result should be saved **also** to the independent memory register. Default `false`.
	 * @returns The result of the expression in the input buffer or `undefined` if the input could not be evaluated.
	 */
	crunch(saveToInd?: boolean): Decimal | undefined;
};

const CalculatorContextObject = createContext<CalculatorContext | null>(null);

/**
 * Returns a handle to the app-global memory registers and user input buffer
 * as well as methods to clear the state and to actually perform the user-given calculation.
 */
export function useCalculator() {
	const handle = useContext(CalculatorContextObject);
	if (!handle) throw Error("Programmer Error: Calculator Context was used outside its Provider");
	return handle;
}

export default function CalculatorProvider({ children }: PropsWithChildren) {
	const buffer = useBuffer();
	const memory = useMemory();

	function clearAll() {
		buffer.empty();
		memory.empty();
	}

	function crunch(saveToInd = false) {
		const result = calculate(buffer.value, memory.ans, memory.ind);
		if (result.isErr()) return;

		const { value } = result;

		buffer.clean();
		memory.setAns(value);
		if (saveToInd) memory.setInd(value);

		return value;
	}

	return (
		<CalculatorContextObject.Provider
			value={{
				buffer,
				memory,
				clearAll,
				crunch,
			}}
		>
			{children}
		</CalculatorContextObject.Provider>
	);
}
