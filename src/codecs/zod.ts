/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { parseZodSchema } from "../core/runtime/codec-guard.js";
import type { Codec, ZodCompatibleSchema } from "../core/types/codec.js";

export type {
  ZodCompatibleSchema,
  ZodSafeParseResult,
} from "../core/types/codec.js";

export type ZodCodecOptions<T> = {
  /** The absent/invalid fallback, validated through `encode` at construction. */
  default?: T;
};

/**
 * Adapts a synchronous, bidirectional Zod schema to a superhref codec.
 *
 * Zod parses URL text in the forward direction and encodes the parsed value
 * back to text in the reverse direction. Invalid or absent URL values resolve
 * to `default`; without one they resolve to `null`. Encoding runs Zod's reverse
 * validation and can throw. Unidirectional `.transform()` schemas throw a
 * `ZodEncodeError` when serialized; use `z.codec()` for transformations.
 *
 * @typeParam T The schema's parsed output type.
 * @param schema A Zod schema whose encoded input type is `string`.
 * @param opts Fallback options with a required default.
 * @returns A codec whose parsed value is always `T`.
 */
export function zodCodec<T extends NonNullable<unknown>>(
  schema: ZodCompatibleSchema<T>,
  opts: { default: NoInfer<T> },
): Codec<T>;
/**
 * Adapts a synchronous Zod schema to a superhref codec. Without a default,
 * absent or invalid URL values parse to `null`.
 *
 * @typeParam T The schema's parsed output type.
 * @param schema A Zod schema whose encoded input type is `string`.
 * @param opts Fallback options.
 * @returns A codec whose parsed value is `T` or `null`.
 */
export function zodCodec<T extends NonNullable<unknown>>(
  schema: ZodCompatibleSchema<T>,
  opts?: ZodCodecOptions<NoInfer<T>>,
): Codec<T | null>;
export function zodCodec<T extends NonNullable<unknown>>(
  schema: ZodCompatibleSchema<T>,
  opts?: ZodCodecOptions<NoInfer<T>>,
): Codec<T> | Codec<T | null> {
  const fallback = opts?.default ?? null;

  if (opts?.default !== undefined) schema.encode(opts.default);

  return {
    parse: (raw) => parseZodSchema(schema, raw, fallback),
    serialize: (value) => (value === null ? null : schema.encode(value)),
  } satisfies Codec<T | null>;
}
