import clsx from "clsx";
import { useCalculator } from "#/state";
import { formatResult } from "#/utils/format-result";

export default function Result() {
	const { buffer, memory } = useCalculator();

	const shouldShowOutput = !buffer.isErr && !buffer.isDirty;
	const formattedOutput = formatResult(memory.ans);

	return (
		<div
			className={clsx(
				"absolute bottom-0",
				"w-full",
				"flex items-center justify-between",
				"transition-all",
				"text-2xl",
				"px-4 py-1",
				"bg-blue-light",
				shouldShowOutput ? "translate-y-0" : "translate-y-full",
			)}
		>
			<span className="pointer-events-none text-slate-500">{"="}</span>
			{shouldShowOutput && <output>{formattedOutput}</output>}
		</div>
	);
}
