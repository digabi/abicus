import { useCalculator } from "#/state";
import errorImgSrc from "./error-img.svg";

export default function ErrorIcon() {
	const { buffer } = useCalculator();

	return (
		<div
			x={[
				"absolute bottom-0 left-0",
				"pointer-events-none",
				"pl-2 py-2",
				"bg-white",
				"transition-all",
				buffer.isErr ? "opacity-100" : "opacity-0",
			]}
			style={{ boxShadow: "0 0 4px 4px white" }}
		>
			<img src={errorImgSrc} x="w-6" />
		</div>
	);
}
