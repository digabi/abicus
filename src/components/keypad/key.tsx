import { ReactNode, MouseEvent } from "react";
import { match } from "ts-pattern";

import { useCalculator } from "#/state";

/*****************************************************************************/

export type RawKeyProps<O extends string = never> = Omit<
	{
		label: ReactNode;
		onClick: () => void;
		tint?: "none" | "red" | "blue-light" | "blue-mid" | "blue-dark";
		className?: any;
	},
	O
>;

export function RawKey({ onClick: propsOnClick, tint = "none", label, className }: RawKeyProps) {
	const { buffer } = useCalculator();

	function onMouseDown(e: MouseEvent<HTMLButtonElement>) {
		e.preventDefault();
		buffer.ref.current?.focus();
	}

	function onClick() {
		propsOnClick();
	}

	return (
		<button
			x={[
				"h-12 key",
				"rounded-sm border border-blue text-2xl",
				[
					"transition-all duration-75",
					"scale-100",
					"active:scale-97",
					match(tint)
						.with("none", () => "bg-white border-blue-border")
						.with("blue-dark", () => "bg-blue-dark text-white border-none")
						.with("blue-mid", () => "bg-blue-mid border-none")
						.with("blue-light", () => "bg-blue-light border-blue-border")
						.with("red", () => "bg-red text-white border-none")
						.exhaustive(),
				],
				className,
			]}
			onClick={onClick}
			onMouseDown={onMouseDown}
		>
			{label}
		</button>
	);
}

/*****************************************************************************/

type BasicKeyProps = RawKeyProps<"onClick" | "label"> & { input: string; label?: ReactNode };

export function BasicKey({ input, label = input, ...props }: BasicKeyProps) {
	const { buffer } = useCalculator();

	function onClick() {
		buffer.input.key(input);
	}

	return <RawKey label={label} onClick={onClick} {...props} />;
}

/*****************************************************************************/

type FunctionKeyProps = RawKeyProps<"onClick" | "label"> & { name: string };

export function FunctionKey({ name, ...props }: FunctionKeyProps) {
	const { buffer } = useCalculator();

	function onClick() {
		buffer.input.func(name);
	}

	return <RawKey label={name} onClick={onClick} {...props} />;
}

/*****************************************************************************/

type OperatorKeyProps = RawKeyProps<"onClick" | "label"> & { symbol: string };

export function OperatorKey({ symbol, ...props }: OperatorKeyProps) {
	const { buffer } = useCalculator();

	function onClick() {
		buffer.input.oper(symbol);
	}

	return <RawKey label={symbol} onClick={onClick} {...props} />;
}
