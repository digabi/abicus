import { ChangeEvent, KeyboardEvent } from "react";
import { useCalculator } from "#/state";

export default function Screen() {
	const { crunch, buffer, memory } = useCalculator();

	function onChange(e: ChangeEvent<HTMLInputElement>) {
		buffer.set(e.target.value);
	}
	function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter") {
			crunch();
		}
	}

	return (
		<>
			<div
				x={[
					"relative",
					"h-24",
					"text-xl font-[Jost]",
					"border rounded-md overflow-hidden",
					"has-[:focus]:ring-2 ring-blue-400",
				]}
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
					{!buffer.isDirty && <output>{memory.ans.toDecimalPlaces(8).toString()}</output>}
				</div>

				{/* Input buffer */}
				<input
					type="text"
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
