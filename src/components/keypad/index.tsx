import { useCalculator } from "#/state";
import { ReactNode } from "react";

import * as keyLabel from "./special-key-labels";
import { match } from "ts-pattern";

export default function Keypad() {
	const calculator = useCalculator();

	return (
		<>
			<div>
				<div x={["inline-grid grid-cols-5 gap-2", "w-96", "font-[Jost]"]}>
					{/* Row #1 */}
					<Key tint="blue" input="" label={keyLabel.memIn} />
					<Key tint="blue" input="" label={keyLabel.memOut} />
					<Key tint="blue" input="ANS" />
					<Key input="log" />
					<Key input="ln" />

					{/* Row #2 */}
					<Key input="sin" />
					<Key input="cos" />
					<Key input="tan" />
					<Key input="^(2)" label={keyLabel.squared} />
					<Key input="sqrt" label="√" />

					{/* Row #3 */}
					<Key input="asin" label="arcsin" />
					<Key input="acos" label="arccos" />
					<Key input="atan" label="arctan" />
					<Key input="*10^()" label={keyLabel.magnitude} />
					<Key input="^()" label={keyLabel.power} />

					{/* Row #4 */}
					<Key input="1" />
					<Key input="2" />
					<Key input="3" />
					<Key tint="grey" input="(" />
					<Key tint="grey" input=")" />

					{/* Row #5 */}
					<Key input="4" />
					<Key input="5" />
					<Key input="6" />
					<Key tint="grey" input="+" />
					<Key tint="grey" input="-" label="−" /* sic: They are different characters */ />

					{/* Row #6 */}
					<Key input="7" />
					<Key input="8" />
					<Key input="9" />
					<Key tint="grey" input="*" label="×" />
					<Key tint="grey" input="/" />

					{/* Row #7 */}
					<Key input="0" ax="col-span-2" />
					<Key input="," />
					<Key input="pi" label="π" />
					<Key input="e" label="e" />

					{/* Row #8 */}
					<FunctionKey tint="blue" label="⌫" onClick={calculator.buffer.del} />
					<FunctionKey tint="blue" label="AC" onClick={calculator.clearAll} />
					<div x="col-span-2" />
					<FunctionKey tint="blue" label="=" onClick={calculator.crunch} />
				</div>
			</div>
		</>
	);
}

type FunctionKeyProps = Required<Pick<KeyProps, "onClick" | "label">> & Pick<KeyProps, "ax" | "tint">;
function FunctionKey(props: FunctionKeyProps) {
	return <Key input="" {...props} />;
}

type KeyProps = {
	input: string;
	tint?: "none" | "blue" | "grey";
	label?: ReactNode;
	ax?: any;
	onClick?: () => void;
};

function Key({ input, onClick, tint = "none", label = input, ax }: KeyProps) {
	const { buffer } = useCalculator();

	function doInput() {
		onClick?.();
		buffer.add(input);
	}

	return (
		<button
			x={[
				"h-9",
				"rounded-sm border border-abi-dgrey",
				[
					"transition-all duration-75",
					"shadow scale-100",
					"active:shadow-none active:scale-95",
					match(tint)
						.with("none", () => "bg-white active:bg-slate-100")
						.with("blue", () => "bg-abi-lblue active:bg-blue-300")
						.with("grey", () => "bg-abi-lgrey active:bg-slate-300")
						.exhaustive(),
				],
				ax,
			]}
			onClick={doInput}
		>
			{label}
		</button>
	);
}
