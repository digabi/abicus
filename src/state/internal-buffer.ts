import { SetStateAction, useRef, useState } from "react";
import { flushSync } from "react-dom";

import prettify from "#/utils/prettify-expression";

export type BufferHandle = ReturnType<typeof useBuffer>;
export default function useBuffer() {
	const [buffer, setBuffer] = useState("");
	const [isDirty, setDirty] = useState(true);
	const [isErr, setErr] = useState(false);

	const ref = useRef<HTMLInputElement>(null);

	function getSelection(): [lhs: number, rhs: number] {
		if (!ref.current) return [0, 0];
		const e = ref.current;
		e.focus();

		return [e.selectionStart!, e.selectionEnd!];
	}

	function isSelection() {
		const [l, r] = getSelection();
		return l !== r;
	}

	function clean() {
		setBuffer(prettify);
		setDirty(false);
		setErr(false);
	}

	function set(value: SetStateAction<string>) {
		setBuffer(value);
		setDirty(true);
		setErr(false);
	}

	function del() {
		flushSync(() => {
			set(v => {
				const [l, r] = getSelection();

				const lhs = l !== r ? v.slice(0, l) : v.slice(0, l).replace(/\s*([a-z]+|.)$/i, "");
				const rhs = v.slice(r);

				setTimeout(() => {
					if (!ref.current) return;
					ref.current.selectionStart = ref.current.selectionEnd = lhs.length;
				});

				return `${lhs}${rhs}`;
			});
		});
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
		// This was exactly as "fun" to figure out how to write as it is to read through

		const [curLhs, curRhs] = getSelection();

		flushSync(() => {
			set(v => {
				const bufLhs = v.slice(0, curLhs);
				const bufRhs = v.slice(curRhs);
				const bufSel = v.slice(curLhs, curRhs);

				const newTxt = action === "replace" ? `${inpLhs}${inpRhs}` : `${inpLhs}${bufSel}${inpRhs}`;

				setTimeout(() => {
					if (!ref.current) return;

					ref.current.selectionStart = ref.current.selectionEnd = bufLhs.length + newTxt.length + cursorOffset;
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
		/** Manually marks the buffer as dirty */
		makeDirty: () => setDirty(true),

		/** Has the buffer been marked as having a syntax error */
		isErr,
		/** Mark the buffer as having a syntax error */
		setErr,

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

			/** Either inserts an operator or wraps the selected text in brackets and adds an operator (and brackets as the other operand) */
			oper(symbol: string) {
				if (isSelection()) {
					rawInput("(", `) ${symbol} ()`, "wrap", -1);
				} else {
					rawInput(symbol, "", "replace", 0);
				}
			},

			power() {
				if (isSelection()) {
					rawInput("(", `)^()`, "wrap", -1);
				} else {
					rawInput("^(", ")", "replace", -1);
				}
			},

			magnitude() {
				if (isSelection()) {
					rawInput("(", `)×10^()`, "wrap", -1);
				} else {
					rawInput("×10^(", ")", "replace", -1);
				}
			},

			square() {
				if (isSelection()) {
					rawInput("(", `)^2`, "wrap", 0);
				} else {
					rawInput("^2", "", "replace", 0);
				}
			},
		},
	} as const;
}
