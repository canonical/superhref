/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * A plain string codec.
 *
 * `parse` returns the URL value unchanged, and an absent key resolves to
 * `default`. `serialize` writes every string back verbatim, the empty
 * string included, so `""` appears as an explicit `?key=` and parsing the
 * URL again yields `""` rather than the default.
 *
 * @param opts Options with a required `default`.
 * @returns A codec whose parsed value is always a `string`, because an
 * absent key resolves to `default`.
 */
export function strCodec(opts: { default: string }): Codec<string>;
/**
 * A plain string codec. Without a `default`, an absent key parses to
 * `null`; only `null` leaves the key out of the URL.
 *
 * @param opts Options.
 * @returns A codec whose parsed value is a `string` or `null`.
 */
export function strCodec(opts?: { default?: string }): Codec<string | null>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string> | Codec<string | null> {
  return {
    parse: (raw) => (raw === null ? (opts?.default ?? null) : raw),
    serialize: (v) => v,
    default: opts?.default,
  } satisfies Codec<string | null>;
}
