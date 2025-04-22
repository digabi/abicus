import { useCalculator } from "#/state";

import { RawKey, BasicKey, FunctionKey, OperatorKey } from "./key";
import * as keyLabel from "./special-key-labels";

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
			<RawKey tint="d-blue" label="AC" onClick={calculator.clearAll} />
		) : (
			<RawKey tint="d-blue" label="C" onClick={calculator.buffer.empty} />
		);

	return (
		<>
			<div>
				<div x={["inline-grid grid-cols-5 gap-2", "w-96"]}>
					{/* Row #1 */}
					<RawKey tint="d-blue" onClick={onClickMemIn} label={keyLabel.memIn} />
					<BasicKey tint="d-blue" input="M" label={keyLabel.memOut} />
					<BasicKey tint="d-blue" input="ANS" />
					<FunctionKey name="log" tint="l-blue" />
					<FunctionKey name="ln" tint="l-blue" />

					{/* Row #2 */}
					<FunctionKey name="sin" tint="l-blue" />
					<FunctionKey name="cos" tint="l-blue" />
					<FunctionKey name="tan" tint="l-blue" />
					<RawKey label={keyLabel.root} onClick={calculator.buffer.input.root} tint="l-blue" />
					<FunctionKey name="√" tint="l-blue" />

					{/* Row #3 */}
					<FunctionKey name="arcsin" tint="l-blue" />
					<FunctionKey name="arccos" tint="l-blue" />
					<FunctionKey name="arctan" tint="l-blue" />
					<RawKey label={keyLabel.power} onClick={calculator.buffer.input.power} tint="l-blue" />
					<RawKey label={keyLabel.squared} onClick={calculator.buffer.input.square} tint="l-blue" />

					{/* Row #4 */}
					<BasicKey input="1" />
					<BasicKey input="2" />
					<BasicKey input="3" />
					<RawKey tint="grey" label="(" onClick={calculator.buffer.input.openBrackets} />
					<RawKey tint="grey" label=")" onClick={calculator.buffer.input.closeBrackets} />

					{/* Row #5 */}
					<BasicKey input="4" />
					<BasicKey input="5" />
					<BasicKey input="6" />
					<OperatorKey tint="grey" symbol="+" />
					<OperatorKey tint="grey" symbol="−" />

					{/* Row #6 */}
					<BasicKey input="7" />
					<BasicKey input="8" />
					<BasicKey input="9" />
					<OperatorKey tint="grey" symbol="×" />
					<OperatorKey tint="grey" symbol="/" />

					{/* Row #7 */}
					<BasicKey input="0" className="col-span-2" />
					<BasicKey input="," />
					<BasicKey input="π" />
					<BasicKey input="e" />

					{/* Row #8 */}
					<RawKey tint="d-blue" label="⌫" onClick={calculator.buffer.del} />
					{clearButton}
					<div x="col-span-2" />
					<RawKey tint="d-blue" label="=" onClick={calculator.crunch} />
				</div>
			</div>
		</>
	);
}
