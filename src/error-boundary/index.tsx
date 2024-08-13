import { Component, PropsWithChildren } from "react";

import errorImgSrc from "./error-img.svg";
import { BUFFER_DEBUG, EXPR_DEBUG, INPUT_DEBUG } from "./constants";

// Currently no way to write Error Boundaries as function components :(

type Props = PropsWithChildren;

export default class ErrorBoundary extends Component<Props, { error: any; stack: any }> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null, stack: null };
	}

	static getDerivedStateFromError(error: any) {
		return { error };
	}

	componentDidCatch(_: unknown, info: any) {
		this.setState(s => ({ ...s, stack: info.componentStack }));
	}

	render() {
		if (this.state.error === null) return this.props.children;

		const error = this.state.error;
		const stack = this.state.stack;

		const message = error.message;

		function onClickReload() {
			location.reload();
		}

		return (
			<main x={["max-w-sm h-screen", "flex flex-col justify-center items-center"]}>
				<div x="grid grid-cols-[5rem_1fr] mt-10">
					<img src={errorImgSrc} x="row-span-2 h-16" />

					<h1 x="text-xl self-center">Jotain meni pieleen!</h1>
					<h1 x="text-xl self-center">Något gick fel!</h1>
				</div>

				<p x="mt-8">Välitäthän alla olevan virheviestin Abitti-tukeen.</p>
				<p x="mb-8">Vänligen lämna feluppgifterna nedan till Abitti-support.</p>

				<output
					x={[
						"w-[24rem] grow",
						"overflow-scroll",
						"px-3 py-2",
						"rounded-md",
						"flex flex-col",
						"text-xs font-mono",
						"bg-abi-blue-2 border border-blue-300",
					]}
				>
					<span>Abicus@{__GIT_HASH__}</span>
					<span>--- Message ---</span>
					<span>{message}</span>
					<span>--- Last Values ---</span>
					<span>Expr: {(window as any)[EXPR_DEBUG]}</span>
					<span>Input: {(window as any)[INPUT_DEBUG]}</span>
					<span>Buffer: {(window as any)[BUFFER_DEBUG]}</span>
					<span>--- Component Stack ---</span>
					<span>{stack}</span>
					<span>--- End ---</span>
				</output>

				<div x="my-8">
					<button
						onClick={onClickReload}
						x={[
							"h-9 px-4",
							"rounded-sm border border-abi-dgrey",

							"shadow scale-100",
							"bg-white active:bg-slate-100",
							"transition-all duration-75",
							"active:shadow-none active:scale-95",
						]}
					>
						Uudelleenkäynnistä / Omstarta
					</button>
				</div>
			</main>
		);
	}
}
