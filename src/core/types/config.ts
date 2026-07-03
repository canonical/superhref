/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Dotted } from "../runtime/keys.js";
import type { AnyCodec, Codecs, CodecValue, Parsed } from "./codec.js";
import type { Section } from "./section.js";
import type { Empty, Pretty } from "./util.js";

/**
 * A config value is one of three shapes, told apart by structure:
 *  - a root `Codec` (has `parse`/`serialize`);
 *  - a bare codecs map (`{ id: codec, … }`) — a section with no actions;
 *  - `{ codecs, actions }` — a section with actions.
 * The action map here is `any` so that any concrete section is assignable to this type;
 * the precise types are read back from each value where they're needed.
 */
// biome-ignore lint/suspicious/noExplicitAny: keeps any concrete section assignable to SectionValue (see above)
export type SectionValue = AnyCodec | Codecs | Section<Codecs, any>;
export type SuperhrefConfig = Record<string, SectionValue>;

/**
 * The codecs of a config value: its `codecs` field if it has one, otherwise the value
 * itself (a bare codecs map), otherwise `Empty` for a root codec (which has neither).
 */
export type CodecsOf<V> = V extends { codecs: infer S extends Codecs }
  ? S
  : V extends Codecs
    ? V
    : Empty;
export type ActionsOf<V> = V extends { actions: infer A } ? A : Empty;

/**
 * The shape `parse` returns: one value per root key, one nested object per section, keyed
 * by the raw URL key. The `Pretty` wrappers are cosmetic — they make editors show the
 * expanded object rather than a type-alias name.
 */
export type SuperhrefParsed<C extends SuperhrefConfig> = Pretty<{
  [K in keyof C]: C[K] extends AnyCodec
    ? CodecValue<C[K]>
    : Pretty<Parsed<CodecsOf<C[K]>>>;
}>;

/** A section's patch payload: each codec key optional; `null` deletes it, `undefined`/absent = no change. */
type SectionPatchInput<S extends Codecs> = Pretty<{
  [K in keyof S]?: CodecValue<S[K]> | null;
}>;

/**
 * The shape `patch` accepts: every key optional. `null` deletes a key (or clears a whole
 * section); `undefined`, or an absent key, leaves it unchanged.
 */
export type SuperhrefPatchInput<C extends SuperhrefConfig> = Pretty<{
  [K in keyof C]?: C[K] extends AnyCodec
    ? CodecValue<C[K]> | null
    : SectionPatchInput<CodecsOf<C[K]>> | null;
}>;

export type SuperhrefPatch<C extends SuperhrefConfig> = (
  partial: SuperhrefPatchInput<C>,
) => string;

/**
 * Every full URL key the config owns: each root key, plus `section.codec` for every codec
 * in every section.
 * @example `{ panel: codec; bugs: { severity: codec } }` → `"panel" | "bugs.severity"`
 */
export type OwnedKey<C extends SuperhrefConfig> = {
  [K in keyof C & string]: C[K] extends AnyCodec
    ? K
    : Dotted<K, keyof CodecsOf<C[K]> & string>;
}[keyof C & string];
