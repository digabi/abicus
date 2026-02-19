import { useCalculator } from "#/state";

import { RawKey, BasicKey, FunctionKey, OperatorKey } from "./key";
import * as keyLabel from "./special-key-labels";

const gitRef = __GIT_REF__.startsWith("v") ? __GIT_REF__ : __GIT_REF__.slice(0, 7);

export default function Keypad() {
	const calculator = useCalculator();

	function onClickMemIn() {
		if (!calculator.buffer.isDirty && !calculator.buffer.isErr) {
			calculator.memory.setInd(calculator.memory.ans);
		} else {
			calculator.crunch(true);
		}
	}

	// Show "clear buffer" (C) button when buffer has content and "clear all" (AC) when buffer is empty
	const clearButton =
		calculator.buffer.value === "" ? (
			<RawKey tint="red" label="AC" onClick={calculator.clearAll} />
		) : (
			<RawKey tint="red" label="C" onClick={calculator.buffer.empty} />
		);

	return (
		<>
			<div>
				<div x={["inline-grid grid-cols-5 gap-2", "w-96"]}>
					{/* Row #1 */}
					<RawKey tint="blue-dark" onClick={onClickMemIn} label={keyLabel.memIn} />
					<BasicKey tint="blue-dark" input="M" label={keyLabel.memOut} />
					<BasicKey tint="blue-dark" input="ANS" />
					<FunctionKey name="log" tint="blue-mid" />
					<FunctionKey name="ln" tint="blue-mid" />

					{/* Row #2 */}
					<FunctionKey name="sin" tint="blue-mid" />
					<FunctionKey name="cos" tint="blue-mid" />
					<FunctionKey name="tan" tint="blue-mid" />
					<RawKey label={keyLabel.root} onClick={calculator.buffer.input.root} tint="blue-mid" />
					<FunctionKey name="√" tint="blue-mid" />

					{/* Row #3 */}
					<FunctionKey name="arcsin" tint="blue-mid" />
					<FunctionKey name="arccos" tint="blue-mid" />
					<FunctionKey name="arctan" tint="blue-mid" />
					<RawKey label={keyLabel.power} onClick={calculator.buffer.input.power} tint="blue-mid" />
					<RawKey label={keyLabel.squared} onClick={calculator.buffer.input.square} tint="blue-mid" />

					{/* Row #4 */}
					<BasicKey input="1" />
					<BasicKey input="2" />
					<BasicKey input="3" />
					<RawKey tint="blue-light" label="(" onClick={calculator.buffer.input.openBrackets} />
					<RawKey tint="blue-light" label=")" onClick={calculator.buffer.input.closeBrackets} />

					{/* Row #5 */}
					<BasicKey input="4" />
					<BasicKey input="5" />
					<BasicKey input="6" />
					<OperatorKey tint="blue-light" symbol="+" />
					<OperatorKey tint="blue-light" symbol="−" />

					{/* Row #6 */}
					<BasicKey input="7" />
					<BasicKey input="8" />
					<BasicKey input="9" />
					<OperatorKey tint="blue-light" symbol="×" />
					<OperatorKey tint="blue-light" symbol="÷" />

					{/* Row #7 */}
					<BasicKey input="0" className="col-span-2" />
					<BasicKey input="," />
					<BasicKey input="π" />
					<BasicKey input="e" />

					{/* Row #8 */}
					<RawKey tint="red" label="⌫" onClick={calculator.buffer.del} />
					{clearButton}
					<div x={["col-span-2", "text-sm text-neutral-400", "inline-flex items-center justify-center"]}>
						Abicus {gitRef}
					</div>
					<RawKey tint="blue-dark" label="=" onClick={calculator.crunch} />
				</div>
			</div>
		</>
	);
}
