import { Component, PropsWithChildren } from "react";

// Currently no way to write Error Boundaries as function components :(

type Props = PropsWithChildren;

export default class ErrorBoundary extends Component<Props, { error: unknown; info?: unknown }> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: unknown) {
		return { error };
	}

	componentDidCatch(_: unknown, info: unknown) {
		this.setState(s => ({ ...s, info }));
	}

	render() {
		if (this.state.error === null) return this.props.children;

		const error = this.state.error;
		const info = this.state.error;

		const message = (error as any)?.message;
		const stack = (info as any)?.componentStack;

		return (
			<main x={["w-max-sm", "flex flex-col items-center gap-4"]}>
				{/* Placeholder icon */}
				<span role="img" x="text-9xl">
					💔
				</span>

				<div x="text-3xl">The calculator has crashed</div>

				<div x="w-full flex flex-col">
					<div x="flex justify-between">
						<div x="text-sm">Diagnostic information:</div>
					</div>
					<textarea disabled x="resize-none text-xs font-mono" value={message} />
					<textarea disabled x="resize-none text-xs font-mono" value={stack} />
				</div>
			</main>
		);
	}
}
