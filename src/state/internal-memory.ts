import Decimal from "decimal.js";
import { useState } from "react";

function zero() {
	return new Decimal(0);
}

export type MemoryHandle = ReturnType<typeof useMemory>;

export default function useMemory() {
	const [ind, setInd] = useState(zero());
	const [ans, setAns] = useState(zero());

	function empty() {
		setInd(zero());
		setInd(zero());
	}

	return {
		/** Value of the independent memory register */
		ind,
		/** Value of the answer memory register */
		ans,
		/** Set the value of the independent memory register */
		setInd,
		/** Set the value of the answer memory register */
		setAns,
		/** Clear all memory registers */
		empty,
	} as const;
}
