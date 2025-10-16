import { ReactNode, MouseEvent } from "react";
import { match } from "ts-pattern";

import { useCalculator } from "#/state";

/*****************************************************************************/

export type RawKeyProps<O extends string = never> = Omit<
	{
		label: ReactNode;
		onClick: () => void;
		tint?: "none" | "d-blue" | "l-blue" | "grey";
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
				"h-9",
				"rounded-xs border border-abi-dgrey",
				[
					"transition-all duration-75",
					"shadow-sm scale-100",
					"active:shadow-none active:scale-95",
					match(tint)
						.with("none", () => "bg-white active:bg-slate-100")
						.with("d-blue", () => "bg-abi-blue-2 active:bg-blue-300")
						.with("l-blue", () => "bg-abi-blue-3 active:bg-blue-100")
						.with("grey", () => "bg-abi-lgrey active:bg-slate-300")
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
