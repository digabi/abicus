import Keypad from "#/components/keypad";
import Screen from "#/components/screen";

const APP_WIDTH = 416;
const APP_HEIGHT = 616;

export default function App() {
	return (
		<div
			style={{
				zoom: `max(.5, min(tan(atan2(100dvw, ${APP_WIDTH}px)), tan(atan2(100dvh, ${APP_HEIGHT}px))))`,
			}}
		>
			<main x={["flex flex-col gap-4 p-4 bg-grey-050"]}>
				<Screen />
				<Keypad />
			</main>
		</div>
	);
}
