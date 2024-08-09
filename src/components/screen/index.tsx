import Input from "./input";

import RadDegToggle from "./rad-deg-toggle";
import Result from "./result";
import ErrorIcon from "./error-icon";

export default function Screen() {
	return (
		<>
			<div
				x={[
					"relative",
					"h-24",
					"text-xl",
					"rounded-md overflow-hidden",
					"border border-abi-dgrey has-[:focus]:border-transparent",
					"has-[:focus]:ring-2 ring-blue-400",
				]}
			>
				<Result />
				<Input />
				<ErrorIcon />
				<RadDegToggle />
			</div>
		</>
	);
}
