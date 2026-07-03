/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/**
 * A plain string codec.
 *
 * `parse` returns the URL value unchanged, and an absent key resolves to
 * `default`. `serialize` writes the string back verbatim, with one nuance
 * around the empty string: it is written as an explicit `?key=` so that
 * parsing the URL again yields the empty string rather than the default.
 *
 * @param opts Options with a required `default`.
 * @returns A codec whose parsed value is always a `string`, because an
 * absent key resolves to `default`.
 */
export function strCodec(opts: { default: string }): Codec<string>;
/**
 * A plain string codec. Without a `default`, an absent key parses to
 * `undefined`, and serializing the empty string leaves the key out of the
 * URL entirely.
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
    serialize: (v) => {
      if (v === undefined) return null;
      if (v === "") return opts?.default !== undefined ? "" : null;
      return v;
    },
    default: opts?.default,
  } satisfies Codec<string | undefined>;
}
