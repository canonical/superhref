/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * One of a fixed set of string literals; anything else coerces to `default`.
 * `enumCodec(["a", "b"])` is `Codec<"a" | "b" | undefined>`; with a `default` it is
 * `Codec<"a" | "b">`.
 */
export function enumCodec<const T extends readonly string[]>(
  values: T,
  opts: { default: T[number] },
): Codec<T[number]>;
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
