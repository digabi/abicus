import { KeyboardEvent, FocusEvent, useEffect, ChangeEvent } from "react";

import { useCalculator } from "#/state";
import { match } from "ts-pattern";

export default function CalculatorInput() {
	const { buffer, crunch } = useCalculator();

	function onChange(e: ChangeEvent<HTMLInputElement>) {
		buffer.set(e.target.value);
	}

	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		match(e.key)
			.with("Enter", "=", () => {
				crunch();
			})
			.with("(", () => {
				buffer.input.openBrackets();
			})
			.with("^", "/", "+", symbol => {
				buffer.input.oper(symbol);
			})
			.with("-", () => {
				buffer.input.oper("−");
			})
			.with("*", () => {
				buffer.input.oper("×");
			})
			.otherwise(() => true) || e.preventDefault();
	}

	function onBlur(e: FocusEvent<HTMLInputElement>) {
		// Timeout needed because of Safari (of course)
		setTimeout(() => {
			e.target.focus();
			e.target.scrollLeft = e.target.scrollWidth;
		}, 0);
	}

	useEffect(
		function BufferInputKeypadInputListener() {
			const element = buffer.ref.current;
			if (!element) return;

			if (document.activeElement !== element) {
				element.scrollLeft = element.scrollWidth;
			}
		},
		[buffer.value]
	);

	return (
		<input
			type="text"
			autoFocus
			ref={buffer.ref}
			value={buffer.value}
			onChange={onChange}
			onKeyDown={onKeyDown}
			onBlur={onBlur}
			x={[
				"absolute bottom-0",
				"w-full h-full",
				"px-4 pt-14",
				"bg-transparent",
				"text-right",
				"transition-transform",
				// Focus is shown by the parent so it's safe to disable here
				"focus:outline-none",
				buffer.isDirty ? "text-black" : "text-slate-500 text-sm",
			]}
			// Safari bug workaround:
			// As of writing this, translating an input in safari without using `translate3d`
			// can cause the content of the input to visually lag behind the container
			style={{ transform: buffer.isDirty ? "translate3d(0, 0, 0)" : "translate3d(0, -2rem, 0)" }}
		/>
	);
}
