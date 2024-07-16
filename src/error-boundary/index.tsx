import { Component, PropsWithChildren } from "react";

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

		return (
			<main x={["max-w-sm h-screen py-4", "flex flex-col justify-between gap-4"]}>
				<div x={["grow", "flex flex-col items-center justify-center"]}>
					{/* Placeholder icon */}
					<span role="img" x="text-9xl">
						💔
					</span>

					<h1 x="text-3xl text-center">
						<div>Ohjelma kaatui</div>
						<div>Programmet har kraschat</div>
					</h1>
				</div>

				<output
					x={[
						"w-[24rem] max-h-52",
						"overflow-scroll",
						"px-3 py-2",
						"rounded-md",
						"flex flex-col",
						"text-xs font-mono",
						"bg-abi-lblue border border-blue-300",
					]}
				>
					<span>--- Message ---</span>
					<span>{message}</span>
					<span>--- Component Stack ---</span>
					<span>{stack}</span>
					<span>--- End ---</span>
				</output>
			</main>
		);
	}
}
