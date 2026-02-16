import { useCalculator } from "#/state";

export default function RadDegToggle() {
	const { angleUnit, degsOn, radsOn } = useCalculator();

	return (
		<div
			x={[
				"absolute top-1 left-1",
				"h-10",
				"border border-blue-border",
				"divide-x divide-abi-dgrey",
				"rounded-md overflow-hidden",
				"flex items-center",
			]}
		>
			<button
				onClick={radsOn}
				disabled={angleUnit === "rad"}
				x={[
					"text-[16px] key",
					"h-full px-3",
					"transition-all",
					angleUnit === "rad" ? "bg-blue-light border-blue-border text-black" : "bg-white border-blue-border",
				]}
			>
				Rad
			</button>
			<button
				onClick={degsOn}
				disabled={angleUnit === "deg"}
				x={[
					"text-[16px] key",
					"h-full px-3",
					"transition-all",
					angleUnit === "deg" ? "bg-blue-light border-blue-border text-black" : "bg-white",
				]}
			>
				Deg
			</button>
		</div>
	);
}
