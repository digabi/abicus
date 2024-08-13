import { useCalculator } from "#/state";

export default function Result() {
	const { buffer, memory } = useCalculator();

	const shouldShowOutput = !buffer.isErr && !buffer.isDirty;
	const formattedOutput = memory.ans.toDecimalPlaces(8).toString().replace(".", ",").replace("-", "−");

	return (
		<div
			x={[
				"absolute bottom-0",
				"w-full",
				"flex items-center justify-between",
				"transition-transform",
				"px-4 py-1",
				"bg-slate-100",
				shouldShowOutput ? "translate-y-0" : "translate-y-full",
			]}
		>
			<span x="pointer-events-none text-slate-500">{"="}</span>
			{shouldShowOutput && <output>{formattedOutput}</output>}
		</div>
	);
}
