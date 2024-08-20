import { useCalculator } from "#/state";

export default function RadDegToggle() {
	const { angleUnit, degsOn, radsOn } = useCalculator();

	return (
		<div
			x={[
				"absolute top-1 left-1",
				"h-6",
				"border border-abi-dgrey",
				"divide-x divide-abi-dgrey",
				"rounded-sm overflow-hidden",
				"flex items-center",
			]}
		>
			<button
				onClick={radsOn}
				x={[
					"text-xs",
					"h-full px-3",
					"transition-all",
					angleUnit === "rad" ? "bg-abi-lgrey text-black" : "bg-white text-abi-dgrey",
				]}
			>
				Rad
			</button>
			<button
				onClick={degsOn}
				x={[
					"text-xs",
					"h-full px-3",
					"transition-all",
					angleUnit === "deg" ? "bg-abi-lgrey text-black" : "bg-white text-abi-dgrey",
				]}
			>
				Deg
			</button>
		</div>
	);
}
