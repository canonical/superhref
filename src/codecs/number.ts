/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * Number with coercion: absent, empty (`?page=`), non-numeric, or non-integer
 * (with `integer`) input falls back to `default`; out-of-range input clamps to
 * `min`/`max`. With a `default` the value type is `number`, otherwise
 * `number | undefined`. (`""` must be treated as missing — `Number("")` is `0`, a
 * classic trap for hand-edited URLs.)
 */
export function numCodec(opts: {
  default: number;
  integer?: boolean;
  min?: number;
  max?: number;
}): Codec<number>;
export function numCodec(opts?: {
  default?: number;
  integer?: boolean;
  min?: number;
  max?: number;
}): Codec<number | undefined>;
export function numCodec(opts?: {
  default?: number;
  integer?: boolean;
  min?: number;
  max?: number;
}): Codec<number> | Codec<number | undefined> {
  return {
    parse: (raw) => {
      if (raw === null || raw === "") return opts?.default;

      const n = Number(raw);
      if (!Number.isFinite(n)) return opts?.default;

      if (opts?.integer && !Number.isInteger(n)) return opts?.default;
      if (opts?.min !== undefined && n < opts.min) return opts.min;
      if (opts?.max !== undefined && n > opts.max) return opts.max;
      return n;
    },
    serialize: (v) => (v === undefined ? null : String(v)),
    default: opts?.default,
  } satisfies Codec<number | undefined>;
}
