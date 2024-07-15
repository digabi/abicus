import { useEffect, useMemo, useState } from "react";
import prettify from "#/utils/prettify-expression";

export type BufferHandle = ReturnType<typeof useBuffer>;
export default function useBuffer() {
	const [isDirty, setDirty] = useState(true);

	const [rawBuffer, setRawBuffer] = useState("");
	const prettied = useMemo(() => prettify(rawBuffer), [rawBuffer]);
	const valueToUse = prettied ?? rawBuffer;

	useEffect(() => setDirty(true), [valueToUse]);

	function clean() {
		setDirty(false);
	}

	function empty() {
		setRawBuffer("");
	}

	function set(text: string) {
		setRawBuffer(text);
	}

	function add(text: string) {
		setRawBuffer(v => v + text);
	}

	function del() {
		setRawBuffer(v => v.replace(/\s*([a-z]+|.)$/i, ""));
	}

	return {
		/** The text in the input buffer */
		value: valueToUse,
		/** Empty the input buffer while also setting the status to "clean" */
		empty,
		/** *Append* text to the input buffer */
		add,
		/** *Overwrite* the input buffer */
		set,
		/** *Delete* the last charact */
		del,

		/** Has the buffer been changed since the last `empty` or `clean` call? An empty buffer is inherently dirty. */
		isDirty: isDirty || valueToUse === "",
		/** Manually sets the status to "not dirty" (namely used when the buffer is evaluated) */
		clean,
	} as const;
}
