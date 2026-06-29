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

/**
 * The element type for a codec record. Uses `Codec<any>`, not `Codec<unknown>`: a `Codec`
 * is invariant in its value type (it's a `serialize` parameter), so `Codec<string>` is not
 * assignable to `Codec<unknown>`, which would make `extends Codecs` checks fail. The real
 * value type is recovered with `infer` from each concrete codec.
 */
export type AnyCodec = Codec<any>;
export type Codecs = Record<string, AnyCodec>;

/**
 * The value type a codec parses to: `Codec<T>` → `T` (`never` for a non-codec).
 * @example `CodecValue<Codec<string | undefined>>` → `string | undefined`
 */
export type CodecValue<X> = X extends Codec<infer T> ? T : never;

/**
 * The parsed value type of a codec record.
 * @example `Parsed<{ page: Codec<number>; q: Codec<string | undefined> }>`
 *          → `{ page: number; q: string | undefined }`
 */
export type Parsed<C extends Codecs> = {
  [K in keyof C]: CodecValue<C[K]>;
};
