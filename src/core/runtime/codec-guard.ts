/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Runtime guards and operations for low-level codecs and direct Zod schemas.
 */

import type {
  AnyCodec,
  Codec,
  Codecs,
  ZodCompatibleSchema,
} from "../types/codec.js";
import type { ConfigValue } from "../types/schema.js";
import type { AnyFunction } from "../types/util.js";

/**
 * Tells whether a schema value is a supported leaf rather than a section.
 *
 * @param v The schema value to test.
 * @returns `true` for a low-level codec or compatible Zod schema.
 */
export function isCodec(v: ConfigValue): v is AnyCodec {
  return isNativeCodec(v) || isZodSchema(v);
}

/** Parses one URL value, coercing direct Zod failures to `null`. */
export function parseCodec(codec: AnyCodec, raw: string | null): unknown {
  return isNativeCodec(codec)
    ? codec.parse(raw)
    : parseZodSchema(codec, raw, null);
}

/** Applies the shared synchronous Zod parse and fallback semantics. */
export function parseZodSchema<T extends NonNullable<unknown>>(
  schema: ZodCompatibleSchema<T>,
  raw: string | null,
  fallback: T | null,
): T | null {
  if (raw === null) return fallback;

  try {
    const result = schema.safeParse(raw);
    return result.success ? result.data : fallback;
  } catch {
    return fallback;
  }
}

/** Serializes one application value through its codec or Zod encode path. */
export function serializeCodec(codec: AnyCodec, value: unknown): string | null {
  return isNativeCodec(codec) ? codec.serialize(value) : codec.encode(value);
}

// biome-ignore lint/suspicious/noExplicitAny: native Codec is invariant in its value type
function isNativeCodec(v: ConfigValue): v is Codec<any> {
  return (
    "parse" in v &&
    typeof v.parse === "function" &&
    "serialize" in v &&
    typeof v.serialize === "function"
  );
}

// biome-ignore lint/suspicious/noExplicitAny: Zod schema is invariant in its output type
function isZodSchema(v: ConfigValue): v is ZodCompatibleSchema<any> {
  return (
    "safeParse" in v &&
    typeof v.safeParse === "function" &&
    "encode" in v &&
    typeof v.encode === "function"
  );
}

/**
 * Splits a section value into its codecs and actions. A section is either a
 * bare codecs map such as `{ id: codec }` or a `{ codecs, actions }` pair. A
 * `.codecs` property means the latter; otherwise the value itself is the
 * codecs map.
 *
 * @param value The section value from the schema.
 * @returns The codecs map and the action map, which is empty for a bare
 * section.
 */
export function sectionOf(value: Exclude<ConfigValue, AnyCodec>) {
  const v = value as { codecs?: Codecs; actions?: Record<string, AnyFunction> };
  return { codecs: v.codecs ?? (value as Codecs), actions: v.actions ?? {} };
}
