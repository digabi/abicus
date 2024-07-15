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
	 */
	crunch(): void;
};

export default function CalculatorProvider({ children }: PropsWithChildren) {
	const buffer = useBuffer();
	const memory = useMemory();

	function clearAll() {
		buffer.empty();
		memory.empty();
	}

	function crunch() {
		const result = calculate(buffer.value, memory.ans, memory.ind);
		if (typeof result === "undefined") return;

		buffer.clean();
		memory.setAns(result);
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

const CalculatorContextObject = createContext<CalculatorContext | null>(null);

export function useCalculator() {
	const handle = useContext(CalculatorContextObject);
	if (!handle) throw Error("Programmer Error: Calculator Context was used outside its Provider");
	return handle;
}
