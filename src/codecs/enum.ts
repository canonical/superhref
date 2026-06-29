import type { Codec } from "../core/types/codec.js";

/**
 * One of a fixed set of string literals; anything else coerces to `default`.
 * `enumCodec(["a", "b"])` is `Codec<"a" | "b" | undefined>`. `URLSearchParams`
 * handles any encoding at the URL boundary, so the membership check and the written
 * value are the plain literal.
 */
export const enumCodec = <const T extends readonly string[]>(
  values: T,
  opts?: { default?: T[number] },
): Codec<T[number] | undefined> => ({
  parse: (raw) =>
    raw != null && (values as readonly string[]).includes(raw)
      ? (raw as T[number])
      : opts?.default,
  serialize: (v) => (v === undefined ? null : v),
  default: opts?.default,
});
