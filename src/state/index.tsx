import Decimal from "decimal.js";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { AngleUnit, calculate } from "#/calculator";

import useBuffer, { BufferHandle } from "./internal-buffer";
import useMemory, { MemoryHandle } from "./internal-memory";

type CalculatorContext = {
	/** Handle to the calculator's input buffer */
	buffer: BufferHandle;
	/** Handle to the calculator's memory registers */
	memory: MemoryHandle;

	/** Clear the input buffer and all memory registers */
	clearAll(): void;

	/** Unit to use in trigonometric functions */
	angleUnit: AngleUnit;
	/** Switch to using radians */
	radsOn(): void;
	/** Switch to using degrees */
	degsOn(): void;

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
	const [angleUnit, setAngleUnit] = useState<AngleUnit>("deg");
	const buffer = useBuffer();
	const memory = useMemory();

	function clearAll() {
		buffer.empty();
		memory.empty();
	}

	function crunch(saveToInd = false) {
		buffer.clean();

		const result = calculate(buffer.value, memory.ans, memory.ind, angleUnit);
		if (result.isErr() || result.value.isNaN() || !result.value.isFinite()) {
			buffer.setErr(true);
			return;
		}

		const { value } = result;

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

				angleUnit,
				radsOn() {
					buffer.makeDirty();
					setAngleUnit("rad");
				},
				degsOn() {
					buffer.makeDirty();
					setAngleUnit("deg");
				},
			}}
		>
			{children}
		</CalculatorContextObject.Provider>
	);
}
