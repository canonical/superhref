/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";

/** Coercion options shared by every `numCodec` overload. */
type NumberBounds = {
  /**
   * When true, input that is not an integer resolves to `default`.
   * @defaultValue false, so fractional numbers are accepted.
   */
  integer?: boolean;
  /**
   * The lowest accepted value. Parsed values below it clamp up to it.
   * @defaultValue undefined, so there is no lower bound.
   */
  min?: number;
  /**
   * The highest accepted value. Parsed values above it clamp down to it.
   * @defaultValue undefined, so there is no upper bound.
   */
  max?: number;
};

/**
 * A number codec that coerces instead of throwing.
 *
 * Input that is absent, empty (`?page=`), not numeric, or fractional while
 * `integer` is set resolves to `default`. Input outside `min` or `max` clamps
 * to the nearest bound. The empty value counts as missing on purpose, because
 * `Number("")` evaluates to `0`, a classic trap with URLs edited by hand.
 *
 * @param opts Coercion options with a required `default`.
 * @returns A codec whose parsed value is always a `number`, because absent or
 * invalid input resolves to `default`.
 */
export function numCodec(
  opts: NumberBounds & { default: number },
): Codec<number>;
/**
 * A number codec that coerces instead of throwing. Without a `default`,
 * absent or invalid input parses to `null`.
 *
 * @param opts Coercion options.
 * @returns A codec whose parsed value is a `number` or `null`.
 */
export function numCodec(
  opts?: NumberBounds & { default?: number },
): Codec<number | null>;
export function numCodec(
  opts?: NumberBounds & { default?: number },
): Codec<number> | Codec<number | null> {
  return {
    parse: (raw) => {
      if (raw === null || raw === "") return opts?.default ?? null;

      const n = Number(raw);
      if (!Number.isFinite(n)) return opts?.default ?? null;

      if (opts?.integer && !Number.isInteger(n)) return opts?.default ?? null;
      if (opts?.min !== undefined && n < opts.min) return opts.min;
      if (opts?.max !== undefined && n > opts.max) return opts.max;
      return n;
    },
    serialize: (v) => (v === null ? null : String(v)),
    default: opts?.default,
  } satisfies Codec<number | null>;
}
