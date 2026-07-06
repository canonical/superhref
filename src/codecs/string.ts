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
 * `undefined`; only `undefined` leaves the key out of the URL.
 *
 * @param opts Options.
 * @returns A codec whose parsed value is a `string` or `undefined`.
 */
export function strCodec(opts?: {
  default?: string;
}): Codec<string | undefined>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string> | Codec<string | undefined> {
  return {
    parse: (raw) => (raw === null ? opts?.default : raw),
    serialize: (v) => (v === undefined ? null : v),
    default: opts?.default,
  } satisfies Codec<string | undefined>;
}
