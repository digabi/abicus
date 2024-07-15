import React from "react";
import ReactDOM from "react-dom/client";

import ErrorBoundary from "#/error-boundary";
import CalculatorProvider from "#/state";
import App from "#/app";

import "#/main.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<ErrorBoundary>
		<React.StrictMode>
			<CalculatorProvider>
				<App />
			</CalculatorProvider>
		</React.StrictMode>
	</ErrorBoundary>
);
