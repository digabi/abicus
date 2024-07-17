import { useCalculator } from "#/state";

import CalculatorInput from "./calc-buffer-input";

export default function Screen() {
	const { buffer, memory } = useCalculator();

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

				<CalculatorInput />
			</div>
		</>
	);
}
