/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * An encode and decode pair for a single search parameter key.
 *
 * A codec deals in plain, already decoded text. The engine reads and writes
 * through `URLSearchParams`, which applies percent decoding on read and
 * percent encoding on write, so `parse` receives a readable string and
 * `serialize` returns one.
 */
export type Codec<T> = {
  /**
   * Turns the raw URL value into a typed value. Receives `null` when the key
   * is absent from the URL. It must never throw, even on hostile input such
   * as a URL edited by hand; it coerces invalid input to a safe value
   * instead.
   */
  parse: (raw: string | null) => T;
  /**
   * Turns a typed value back into URL text. Returning `null` represents the
   * value by leaving the key out of the URL entirely. A codec must never map
   * two distinct representable values to absence, because they would become
   * indistinguishable when the URL is parsed again.
   */
  serialize: (value: T) => string | null;
  /**
   * The value that absent or invalid input resolves to.
   * @defaultValue `undefined`, so an absent key parses to `undefined`.
   */
  default?: T;
};
