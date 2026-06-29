import type { AnyCodec } from "../types/codec.js";

/**
 * Write one full URL key. `undefined` leaves the key unchanged; `null` deletes it.
 * A `serialize` returning `null` also deletes (a codec's way of saying "this value has
 * no URL form"). Otherwise the value is written verbatim — a value equal to the
 * codec's `default` still appears in the URL; use `null` if you want the key absent.
 * `URLSearchParams.set` percent-encodes the string, so codecs return plain values.
 */
export const writeKey = (
  params: URLSearchParams,
  fullKey: string,
  codec: AnyCodec,
  value: unknown,
): void => {
  if (value === undefined) return;
  if (value === null) {
    params.delete(fullKey);
    return;
  }
  const s = codec.serialize(value);
  if (s == null) {
    params.delete(fullKey);
    return;
  }
  params.set(fullKey, s);
};
