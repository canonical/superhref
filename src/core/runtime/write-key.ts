/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { AnyCodec } from "../types/codec.js";

/**
 * Writes one full URL key. `undefined` leaves the key unchanged and `null`
 * deletes it. A `serialize` that returns `null` also deletes, which is a
 * codec's way of saying the value has no URL form. Any other value is
 * written verbatim, so a value equal to the codec's `default` still appears
 * in the URL; use `null` to make the key absent. `URLSearchParams.set`
 * applies percent encoding, so codecs return plain values.
 *
 * @param params The search params to mutate in place.
 * @param fullKey The full URL key to write.
 * @param codec The codec that serializes the value.
 * @param value The value to write.
 */
export function writeKey(
  params: URLSearchParams,
  fullKey: string,
  codec: AnyCodec,
  value: unknown,
): void {
  if (value === undefined) return;
  if (value === null) {
    params.delete(fullKey);
    return;
  }
  const s = codec.serialize(value);
  if (s === null) {
    params.delete(fullKey);
    return;
  }
  params.set(fullKey, s);
}
