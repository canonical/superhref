/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The leaf schema contracts and the types derived from them. A leaf can be a
 * low-level `Codec` or a synchronous, bidirectional Zod schema.
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
};

export type ZodSafeParseResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false };

/**
 * The structural Zod surface accepted as a schema leaf. An encoded input of
 * `string` ensures the parsed value can round-trip through one URL parameter.
 * The engine coerces forward parse failures to `null`; reverse encode failures
 * propagate to the caller.
 */
export type ZodCompatibleSchema<T extends NonNullable<unknown>> = {
  safeParse(value: unknown): ZodSafeParseResult<T>;
  encode(value: T): string;
};

/**
 * Any supported leaf schema. `any` is required because both contracts are
 * invariant in their value type through the encode/serialize parameter. The
 * concrete value type is recovered with `infer` below.
 */
// biome-ignore lint/suspicious/noExplicitAny: leaf schemas are invariant in their value type
export type AnyCodec = Codec<any> | ZodCompatibleSchema<any>;
export type Codecs = Record<string, AnyCodec>;

/**
 * The parsed value type of a leaf. A low-level `Codec<T>` controls absence
 * itself. A direct Zod schema resolves absent or invalid URL input to `null`.
 */
export type CodecValue<X> =
  X extends Codec<infer T>
    ? T
    : X extends ZodCompatibleSchema<infer T>
      ? T | null
      : never;

/**
 * The parsed value type of a codec record.
 * @example `Parsed<{ page: Codec<number>; q: Codec<string | null> }>`
 *          resolves to `{ page: number; q: string | null }`.
 */
export type Parsed<C extends Codecs> = {
  [K in keyof C]: CodecValue<C[K]>;
};
