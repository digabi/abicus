import { useRef, KeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { useCalculator } from "#/state";

export default function CalculatorInput() {
	const { buffer, crunch } = useCalculator();
	const elementRef = useRef<HTMLInputElement>(null);

	function onChange() {
		const element = elementRef.current;
		if (!element) return;

		// Guaranteed to be non-null as per
		// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/selectionStart
		const rhs = element.selectionEnd!;

		// How far the cursor is from the right edge of the box before insert
		const rhsOffset = element.value.length - rhs;

		// Must flush current render now to make sure the selection setting below happens at the correct state
		flushSync(() => buffer.set(element.value));

		// New value might be shorter or longer than what we physically typed, so we set cursor to the last offset
		// position *from the right* to make it look like the key press actually inserted what appeared on the screen
		const bufLen = element.value.length;
		const curPos = bufLen - rhsOffset;

		element.setSelectionRange(curPos, curPos);
	}

	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		const element = elementRef.current;
		if (!element) return;

		switch (e.key) {
			case "Enter":
				crunch();
				break;

			case "Backspace":
			case "Delete":
				{
					const lhs = element.selectionStart!;
					const rhs = element.selectionEnd!;

					// Selections don't need custom deletion logic
					const isSelection = lhs !== rhs;
					if (isSelection) return;

					e.preventDefault();

					const lSlice = element.value.slice(0, lhs);
					const rSlice = element.value.slice(rhs);

					if (e.key === "Delete") {
						flushSync(() => buffer.set(() => lSlice + rSlice.replace(/^\s*([a-z]+|.)/, "")));
						element.setSelectionRange(lhs, lhs);
					} else {
						const rhsOffset = element.value.length - rhs;

						flushSync(() => buffer.set(() => lSlice.replace(/([a-z]+|.)\s*$/, "") + rSlice));

						const bufLen = element.value.length;
						const curPos = bufLen - rhsOffset;

						element.setSelectionRange(curPos, curPos);
					}
				}
				break;
		}
	}

	return (
		<input
			type="text"
			ref={elementRef}
			value={buffer.value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			x={[
				"absolute bottom-0",
				"w-full h-full",
				"px-4 pt-14",
				"bg-transparent",
				"text-right",
				"transition-transform",
				// Focus is shown by the parent so it's safe to disable here
				"focus:outline-none",
				buffer.isDirty ? "text-black" : "text-slate-500",
			]}
			// Safari bug workaround:
			// As of writing this, translating an input in safari without using `translate3d`
			// can cause the content of the input to visually lag behind the container
			style={{ transform: buffer.isDirty ? "translate3d(0, 0, 0)" : "translate3d(0, -2rem, 0)" }}
		/>
	);
}
