/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Runtime guards that tell the two config value shapes apart: `isCodec` for
 * root codecs and `sectionOf` for reading a section's codecs and actions.
 */

import type { AnyCodec, Codecs } from "../types/codec.js";
import type { AnyFunction } from "./context.js";

/**
 * Tells whether a config value is a codec rather than a section. Codecs have
 * `parse` and `serialize` functions; sections don't.
 *
 * @param v The config value to test.
 * @returns `true` when the value is a codec.
 */
// biome-ignore lint/suspicious/noExplicitAny: runtime type guard over untyped config values
export function isCodec(v: any): v is AnyCodec {
  return (
    !!v && typeof v.parse === "function" && typeof v.serialize === "function"
  );
}

/**
 * Splits a section value into its codecs and actions. A section is either a
 * bare codecs map such as `{ id: codec }` or a `{ codecs, actions }` pair. A
 * `.codecs` property means the latter; otherwise the value itself is the
 * codecs map.
 *
 * @param value The section value from the config.
 * @returns The codecs map and the action map, which is empty for a bare
 * section.
 */
export function sectionOf(value: object): {
  codecs: Codecs;
  actions: Record<string, AnyFunction>;
} {
  const v = value as { codecs?: Codecs; actions?: Record<string, AnyFunction> };
  return { codecs: v.codecs ?? (value as Codecs), actions: v.actions ?? {} };
}
