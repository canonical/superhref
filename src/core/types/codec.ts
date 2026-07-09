/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The codec contract and the types derived from it. `Codec` defines the
 * encode and decode pair itself; the remaining types let other modules
 * accept records of codecs and recover the value types they carry.
 */

/**
 * An encode and decode pair for a single search parameter key.
 *
 * A codec deals in plain, already decoded text. The engine reads and writes
 * through `URLSearchParams`, which applies percent decoding on read and
 * percent encoding on write, so `parse` receives a readable string and
 * `serialize` returns one.
 */
export type Codec<T extends NonNullable<unknown> | null> = {
  /**
   * Turns the raw URL value into a typed value. Receives `null` when the key
   * is absent from the URL. It must never throw, even on hostile input such
   * as a URL edited by hand; it coerces invalid input to a safe value
   * instead.
   */
  parse: (raw: string | null) => T;
  /**
   * Turns a typed value back into URL text. Returning `null` represents the
   * value by leaving the key out of the URL entirely, and a `null` value (the
   * absent value) always serializes back to `null`. A codec must never map
   * two distinct representable values to absence, because they would become
   * indistinguishable when the URL is parsed again.
   */
  serialize: (value: T | null) => string | null;
  /**
   * The value that absent or invalid input resolves to.
   * @defaultValue `undefined`, an absent key parses to `null`.
   */
  default?: T;
};

/**
 * The element type for a codec record. Uses `Codec<any>`, not `Codec<unknown>`: a `Codec`
 * is invariant in its value type (it's a `serialize` parameter), so `Codec<string>` is not
 * assignable to `Codec<unknown>`, which would make `extends Codecs` checks fail. The real
 * value type is recovered with `infer` from each concrete codec.
 */
// biome-ignore lint/suspicious/noExplicitAny: Codec is invariant in T, so Codec<unknown> breaks 'extends Codecs' checks (see above)
export type AnyCodec = Codec<any>;
export type Codecs = Record<string, AnyCodec>;

/**
 * The value type a codec parses to. `Codec<T>` resolves to `T`; anything
 * that is not a codec resolves to `never`.
 * @example `CodecValue<Codec<string | null>>` resolves to `string | null`.
 */
export type CodecValue<X> = X extends Codec<infer T> ? T : never;

/**
 * The parsed value type of a codec record.
 * @example `Parsed<{ page: Codec<number>; q: Codec<string | null> }>`
 *          resolves to `{ page: number; q: string | null }`.
 */
export type Parsed<C extends Codecs> = {
  [K in keyof C]: CodecValue<C[K]>;
};
