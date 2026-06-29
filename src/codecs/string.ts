import type { Codec } from "../core/types/codec.js";

/**
 * A plain string. `URLSearchParams` percent-encodes on write and decodes on read at
 * the URL boundary, so the codec deals in plain values: parsing is almost the
 * identity and serializing returns the string as-is.
 *
 * Absence → `default` (or `undefined`). An empty string normally serializes to
 * absence — but when a non-empty `default` exists, `""` is written as an explicit
 * `?key=` so it can't silently resurrect the default on re-parse.
 */
export const strCodec = (opts?: {
  default?: string;
}): Codec<string | undefined> => ({
  parse: (raw) => (raw == null ? opts?.default : raw),
  serialize: (v) => {
    if (v === undefined) return null;
    if (v === "") return opts?.default ? "" : null;
    return v;
  },
  default: opts?.default,
});
