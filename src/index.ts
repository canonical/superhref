/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * @canonical/superhref
 *
 * Typed, composable URL search params schema plus a bound object for reading and writing them.
 * The schema is a tree of codecs and sections, each section with its own codecs and actions.
 * @module superhref
 */

export * from "./codecs/index.js";
export type {
  ActionMap,
  BoundSuperhref,
  ResolvedAction,
  ResolvedActions,
  SectionHandle,
} from "./core/types/bound.js";

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
  Section as SectionSchema,
  SectionAction,
  SectionActionMap,
  SectionPatch,
} from "./core/types/section.js";
export type { Superhref } from "./core/types/superhref.js";
export * from "./patterns/index.js";
export { superhref } from "./superhref.js";
