import { useCalculator } from "#/state";

import { RawKey, BasicKey, FunctionKey } from "./key";
import * as keyLabel from "./special-key-labels";

export default function Keypad() {
	const calculator = useCalculator();

	function onClickMemIn() {
		calculator.crunch(true);
	}

	function onClickSquare() {
		calculator.buffer.input.raw("(", ")^2", "wrap", 0);
	}

	function onClickPower() {
		calculator.buffer.input.raw("(", ")^()", "wrap", -1);
	}

	function onClickMagnitude() {
		calculator.buffer.input.raw("(", ")×10^()", "wrap", -1);
	}

	// Show "clear buffer" (C) button when buffer has content and "clear all" (AC) when buffer is empty
	const clearButton =
		calculator.buffer.value === "" ? (
			<RawKey tint="blue" label="AC" onClick={calculator.clearAll} />
		) : (
			<RawKey tint="blue" label="C" onClick={calculator.buffer.empty} />
		);

	return (
		<>
			<div>
				<div x={["inline-grid grid-cols-5 gap-2", "w-96"]}>
					{/* Row #1 */}
					<RawKey tint="blue" onClick={onClickMemIn} label={keyLabel.memIn} />
					<BasicKey tint="blue" input="MEM" label={keyLabel.memOut} />
					<BasicKey tint="blue" input="ANS" />
					<BasicKey input="log" />
					<BasicKey input="ln" />

					{/* Row #2 */}
					<FunctionKey name="sin" />
					<FunctionKey name="cos" />
					<FunctionKey name="tan" />
					<RawKey label={keyLabel.squared} onClick={onClickSquare} />
					<FunctionKey name="√" />

					{/* Row #3 */}
					<FunctionKey name="arcsin" />
					<FunctionKey name="arccos" />
					<FunctionKey name="arctan" />
					<RawKey label={keyLabel.magnitude} onClick={onClickMagnitude} />
					<RawKey label={keyLabel.power} onClick={onClickPower} />

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
					<BasicKey tint="grey" input="+" />
					<BasicKey tint="grey" input="−" />

					{/* Row #6 */}
					<BasicKey input="7" />
					<BasicKey input="8" />
					<BasicKey input="9" />
					<BasicKey tint="grey" input="×" />
					<BasicKey tint="grey" input="/" />

					{/* Row #7 */}
					<BasicKey input="0" className="col-span-2" />
					<BasicKey input="," />
					<BasicKey input="π" />
					<BasicKey input="e" />

					{/* Row #8 */}
					<RawKey tint="blue" label="⌫" onClick={calculator.buffer.del} />
					{clearButton}
					<div x="col-span-2" />
					<RawKey tint="blue" label="=" onClick={calculator.crunch} />
				</div>
			</div>
		</>
	);
}
