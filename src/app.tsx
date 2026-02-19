import Keypad from "#/components/keypad";
import Screen from "#/components/screen";

export default function App() {
	return (
		<main x={["flex flex-col gap-4 p-4 bg-grey-050"]}>
			<Screen />
			<Keypad />
		</main>
	);
}
