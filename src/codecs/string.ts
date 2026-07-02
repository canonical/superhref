/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * A plain string: `parse` is almost always the identity and `serialize` returns the
 * string as-is. With a `default` the value type is `string`, otherwise
 * `string | undefined`.
 *
 * Absence → `default` (or `undefined`). An empty string serializes to absence unless
 * a `default` is provided, in which case `""` is written as an explicit `?key=` so it
 * can't silently resurrect the default on re-parse.
 */
export function strCodec(opts: { default: string }): Codec<string>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string | undefined>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string> | Codec<string | undefined> {
  return {
    parse: (raw) => (raw === null ? opts?.default : raw),
    serialize: (v) => {
      if (v === undefined) return null;
      if (v === "") return opts?.default !== undefined ? "" : null;
      return v;
    },
    default: opts?.default,
  } satisfies Codec<string | undefined>;
}
