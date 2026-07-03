/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * @canonical/superhref
 *
 * Typed, composable URL search parameter state. The URL **is** the state:
 * an instance
 * holds nothing and is a set of pure functions over a `URL` you pass in each time.
 *
 * A minimal engine: `parse`/`patch`/`clear`/`bind`, one typed `.set(key, value)` per
 * level, and section plus top level actions. `URLSearchParams` owns
 * percent encoding, so codecs deal in plain values. A config value is one of three
 * shapes: `{ key: codec }` (root key), `{ key: { …codecs } }` (actionless section), or
 * `{ key: withActions({ …codecs }, { …actions }) }` (section with actions).
 * @module superhref
 */

// The single entry point: codecs and patterns ride along.
export * from "./codecs/index.js";
export type {
  ActionMap,
  BoundSuperhref,
  ResolvedAction,
  ResolvedActions,
  SectionHandle,
} from "./core/types/bound.js";
// Public types.
export type { AnyCodec, Codec, Codecs, Parsed } from "./core/types/codec.js";
export type {
  ConfigValue,
  OwnedKey,
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
} from "./core/types/config.js";
export type {
  Section as SectionConfig,
  SectionAction,
  SectionActionMap,
  SectionPatch,
} from "./core/types/section.js";
export type { Superhref } from "./core/types/superhref.js";
export * from "./patterns/index.js";
export { superhref } from "./superhref.js";
