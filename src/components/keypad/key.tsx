import { useCalculator } from "#/state";
import { ReactNode } from "react";
import { match } from "ts-pattern";

/*****************************************************************************/

export type RawKeyProps<O extends string = never> = Omit<
	{
		label: ReactNode;
		onClick: () => void;
		tint?: "none" | "blue" | "grey";
		className?: any;
	},
	O
>;

export function RawKey({ onClick, tint = "none", label, className }: RawKeyProps) {
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
				className,
			]}
			onClick={onClick}
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
