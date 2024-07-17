import { ChangeEvent, KeyboardEvent, useRef } from "react";
import { flushSync } from "react-dom";

import { useCalculator } from "#/state";

export default function Screen() {
	const { crunch, buffer, memory } = useCalculator();
	const inputRef = useRef<HTMLInputElement>(null);

	// TODO: The controlled input should definitely be its own component at this point

	function onChange(_: ChangeEvent<HTMLInputElement>) {
		const element = inputRef.current;
		if (!element) return;

		// Guaranteed to be non-null as per https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/selectionStart
		const rhs = element.selectionEnd!;

		// How far the cursor is from the right edge of the box before insert?
		const rhsOffset = element.value.length - rhs;

		flushSync(() => buffer.set(element.value));

		// New value might be longer than expected so we set cursor to the last offset position from the right
		const bufLen = element.value.length;
		const curPos = bufLen - rhsOffset;

		element.setSelectionRange(curPos, curPos);
	}

	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		const element = inputRef.current;
		if (!element) return;

		// Guaranteed to be non-null as per https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/selectionStart
		const lhs = element.selectionStart!;
		const rhs = element.selectionEnd!;

		switch (e.key) {
			case "Enter":
				crunch();
				break;

			case "Backspace":
			case "Delete":
				{
					const isSlice = lhs !== rhs;
					if (isSlice) return;

					e.preventDefault();

					const lSlice = element.value.slice(0, lhs);
					const rSlice = element.value.slice(rhs);

					if (e.key === "Backspace") {
						const rhsOffset = element.value.length - rhs;

						flushSync(() => buffer.set(() => lSlice.replace(/([a-z]+|.)\s*$/, "") + rSlice));

						const bufLen = element.value.length;
						const curPos = bufLen - rhsOffset;

						element.setSelectionRange(curPos, curPos);
					} else {
						flushSync(() => buffer.set(() => lSlice + rSlice.replace(/^\s*([a-z]+|.)/, "")));
						element.setSelectionRange(lhs, lhs);
					}
				}
				break;
		}
	}

	return (
		<>
			<div
				x={["relative", "h-24", "text-xl", "border rounded-md overflow-hidden", "has-[:focus]:ring-2 ring-blue-400"]}
			>
				{/* Sliding background */}
				<div
					x={[
						"absolute top-full w-full h-full",
						"bg-slate-100",
						"transition-transform",
						buffer.isDirty ? "translate-y-0" : "-translate-y-9",
					]}
				/>

				{/* Result */}
				<div
					x={[
						"absolute bottom-0",
						"w-full h-full",
						"px-4 pt-14",
						"flex items-center justify-between",
						"transition-transform",
						buffer.isDirty ? "translate-y-8" : "translate-y-0",
					]}
				>
					<span x="pointer-events-none text-slate-500">{"="}</span>
					{!buffer.isDirty && (
						<output>{memory.ans.toDecimalPlaces(8).toString().replace(".", ",").replace("-", "−")}</output>
					)}
				</div>

				{/* Input buffer */}
				<input
					type="text"
					ref={inputRef}
					// Using Translate3D works around a Safari bug where the text stays put while the box moves
					style={{ transform: buffer.isDirty ? "translate3d(0, 0, 0)" : "translate3d(0, -2rem, 0)" }}
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
					value={buffer.value}
					onChange={onChange}
					onKeyDown={onKeyDown}
				/>
			</div>
		</>
	);
}
