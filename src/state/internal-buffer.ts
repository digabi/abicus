import { SetStateAction, useRef, useState } from "react";
import { flushSync } from "react-dom";

import prettify from "#/utils/prettify-expression";

export type BufferHandle = ReturnType<typeof useBuffer>;
export default function useBuffer() {
	const [isDirty, setDirty] = useState(true);
	const [buffer, setBuffer] = useState("");
	const ref = useRef<HTMLInputElement>(null);

	function clean() {
		setBuffer(prettify);
		setDirty(false);
	}

	function set(value: SetStateAction<string>) {
		setBuffer(value);
		setDirty(true);
	}

	function del() {
		set(v => v.replace(/\s*([a-z]+|.)$/i, ""));
	}

	function getSelection(): [lhs: number, rhs: number] {
		if (!ref.current) return [0, 0];
		const e = ref.current;
		e.focus();

		return [e.selectionStart!, e.selectionEnd!];
	}

	/**
	 * Inputs the given text to the buffer and sets the cursor position.
	 *
	 * The user can select text in the buffer, and hence the function expects two inputs:
	 * a left-hand-side and a right-hand-side. If the `action` argument is set to `"wrap"` the selection
	 * will be wrapped in the left and right inputs. Finally the cursor is placed at the specified offset
	 * from the new input. I.e. if the offset is `0` the cursor will be placed after the input text.
	 */
	function rawInput(inpLhs: string, inpRhs: string, action: "replace" | "wrap", cursorOffset: number) {
		const [curLhs, curRhs] = getSelection();

		flushSync(() => {
			set(v => {
				const bufLhs = v.slice(0, curLhs);
				const bufRhs = v.slice(curRhs);
				const bufSel = v.slice(curLhs, curRhs);

				const newTxt = action === "replace" ? `${inpLhs}${inpRhs}` : `${inpLhs}${bufSel}${inpRhs}`;

				setTimeout(() => {
					if (!ref.current) return;

					ref.current.selectionStart = ref.current.selectionEnd =
						bufLhs.length + inpLhs.length + (action === "wrap" ? bufSel.length : 0) + inpRhs.length + cursorOffset;
				});

				return `${bufLhs}${newTxt}${bufRhs}`;
			});
		});
	}

	return {
		/** The text in the input buffer */
		value: buffer,
		/** *Overwrite* the input buffer */
		set,
		/** *Delete* the last character or a full token if applicable */
		del,
		/** Manually sets the status to "not dirty" (namely used when the buffer is evaluated) */
		clean,
		/** Empty the input buffer */
		empty: () => set(""),
		/** Has the buffer been changed since the last `clean` call? An empty buffer is inherently dirty. */
		isDirty: isDirty || buffer === "",

		/** Ref object to attach to the `input` element tied to this buffer */
		ref,

		input: {
			raw: rawInput,

			/** Insert a regular symbol (e.g. `3` or `+`) into the buffer */
			key(text: string) {
				rawInput(text, "", "replace", 0);
			},
			/** Insert a function (e.g. `sin()`) into the buffer, wrapping selected text */
			func(name: string) {
				rawInput(`${name}(`, ")", "wrap", -1);
			},
			/** Insert a pair of brackets into the buffer, wrapping selected text */
			openBrackets() {
				rawInput("(", ")", "wrap", -1);
			},
			/** Either insert a right-bracket or skip over one, depending if one already exists in the input */
			closeBrackets() {
				const [l, r] = getSelection();
				if (l === r && ref.current?.value.slice(l).startsWith(")")) {
					ref.current.selectionEnd = ref.current.selectionStart = ref.current.selectionEnd! + 1;
				} else {
					rawInput(")", "", "replace", 0);
				}
			},
		},
	} as const;
}
