/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * A codec for one of a fixed set of string literals.
 *
 * `parse` accepts only members of `values`; anything else, including an
 * absent key, resolves to `default`. The parsed value keeps the literal
 * union type of `values`, so `enumCodec(["a", "b"], { default: "a" })`
 * produces `Codec<"a" | "b">`.
 *
 * @typeParam T The accepted literals, inferred from `values`.
 * @param values The accepted string literals.
 * @param opts Options with a required `default`.
 * @returns A codec whose parsed value is always one of `values`, because
 * anything else resolves to `default`.
 */
export function enumCodec<const T extends readonly string[]>(
  values: T,
  opts: { default: T[number] },
): Codec<T[number]>;
/**
 * A codec for one of a fixed set of string literals. Without a `default`,
 * input outside `values` and absent keys parse to `undefined`, so
 * `enumCodec(["a", "b"])` produces `Codec<"a" | "b" | undefined>`.
 *
 * @typeParam T The accepted literals, inferred from `values`.
 * @param values The accepted string literals.
 * @param opts Options.
 * @returns A codec whose parsed value is one of `values` or `undefined`.
 */
export function enumCodec<const T extends readonly string[]>(
  values: T,
  opts?: { default?: T[number] },
): Codec<T[number] | undefined>;
export function enumCodec<const T extends readonly string[]>(
  values: T,
  opts?: { default?: T[number] },
): Codec<T[number]> | Codec<T[number] | undefined> {
  return {
    parse: (raw) =>
      raw !== null && values.includes(raw) ? (raw as T[number]) : opts?.default,
    serialize: (v) => (v === undefined ? null : v),
    default: opts?.default,
  } satisfies Codec<T[number] | undefined>;
}
