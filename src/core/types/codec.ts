/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * An encode/decode pair for a single search-param key.
 * `parse` turns the URL value into a typed value; `serialize` turns it back (or
 * `null` to omit the key).
 *
 * Contract notes:
 * - `parse` must never throw on hostile input (hand-edited URLs); coerce instead.
 * - Codecs deal in PLAIN (already-decoded) values: the engine reads/writes through
 *   `URLSearchParams`, which percent-decodes on read and percent-encodes on write.
 *   So `parse` receives a decoded string and `serialize` returns a plain string.
 * - `serialize(v) === null` means "this value is represented by key absence".
 *   A codec must never map two *distinct* representable values to absence.
 */
export type Codec<T> = {
  parse: (raw: string | null) => T;
  serialize: (value: T) => string | null;
  default?: T;
};
