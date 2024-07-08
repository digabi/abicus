/*
 * A shorthand for writing `className`s with `clsx`.
 *
 * This file works with the `transform-jsx-classnames` and `babel-plugin-rename-jsx-attribute`
 * babel plugins (see the `vite.config.ts` file) to add an `x` attribute to all HTML elements
 * in JSX. The value of the `x` attribute will effectively be wrapped in `clsx(...)` by the
 * `transform-jsx-classnames` plugin. The `x` will then further be renamed to `className` by
 * the `babel-plugin-rename-jsx-attribute` plugin.
 *
 * Example:
 * ```
 * <div x={[true && "is-open"]} /> => <div class="is-open" />
 * ```
 */

export type ClassValue = ClassPrimitive | ClassArray | ClassDictionary;

// The `any` type in `ClassDictionary` is required to stop infinite recursion.
// For some reason `ClassArray` works fine even though it's recursive too.
// (TypeScript v5.5.2)
export type ClassDictionary = Record<string, any>;
export type ClassArray = ClassValue[];
export type ClassPrimitive = string | number | bigint | null | boolean | undefined;

declare module "react" {
	interface HTMLAttributes {
		x?: ClassValue;
	}
}
