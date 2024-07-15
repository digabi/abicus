import Keypad from "#/components/keypad";
import Screen from "#/components/screen";

export default function App() {
	return (
		<>
			<div x={["max-w-sm", "flex justify-center"]}>
				<main x={["flex flex-col gap-4"]}>
					<Screen />
					<Keypad />
				</main>
			</div>
		</>
	);
}
