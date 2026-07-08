/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The config shape and every type derived from it: what a config value may
 * be, the shape `parse` returns, the payload `patch` accepts, and the full
 * set of URL keys a config owns.
 */

import type { Dotted } from "../runtime/keys.js";
import type { AnyCodec, Codecs, CodecValue, Parsed } from "./codec.js";
import type { Section } from "./section.js";
import type { Empty, Pretty } from "./util.js";

/**
 * A config value is one of three shapes, told apart by structure: a root
 * `Codec` with `parse` and `serialize`, a bare codecs map such as
 * `{ id: codec }` for a section with no actions, or `{ codecs, actions }`
 * for a section with actions. The action map here is `any` so that any
 * concrete section is assignable to this type; the precise types are read
 * back from each value where they are needed.
 */
// biome-ignore lint/suspicious/noExplicitAny: keeps any concrete section assignable to ConfigValue (see above)
export type ConfigValue = AnyCodec | Codecs | Section<Codecs, any>;
export type SuperhrefConfig = Record<string, ConfigValue>;

/**
 * The codecs of a config value: its `codecs` field if it has one, otherwise the value
 * itself (a bare codecs map), otherwise `never` for a root codec (which has neither).
 */
export type CodecsOf<V extends ConfigValue> = V extends {
  codecs: infer S extends Codecs;
}
  ? S
  : V extends Codecs
    ? V
    : never;
/**
 * The action map of a config value: its `actions` field if it has one,
 * otherwise `Empty`.
 */
export type ActionsOf<V extends ConfigValue> = V extends { actions: infer A }
  ? A
  : Empty;

/**
 * The shape `parse` returns: one value per root key, one nested object per section, keyed
 * by the raw URL key. The `Pretty` wrappers are cosmetic; they make editors
 * show the expanded object rather than a type alias name.
 */
export type SuperhrefParsed<C extends SuperhrefConfig> = Pretty<{
  [K in keyof C]: C[K] extends AnyCodec
    ? CodecValue<C[K]>
    : Pretty<Parsed<CodecsOf<C[K]>>>;
}>;

/**
 * A section's patch payload: every codec key optional, where `null` deletes
 * the key and `undefined` or absence leaves it unchanged.
 */
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

/** Applies a nested partial update and returns the new search string. */
export type SuperhrefPatch<C extends SuperhrefConfig> = (
  partial: SuperhrefPatchInput<C>,
) => string;

/**
 * Every full URL key the config owns: each root key, plus `section.codec` for every codec
 * in every section.
 * @example `{ panel: codec; bugs: { severity: codec } }` resolves to `"panel" | "bugs.severity"`.
 */
export type OwnedKey<C extends SuperhrefConfig> = {
  [K in keyof C & string]: C[K] extends AnyCodec
    ? K
    : Dotted<K, keyof CodecsOf<C[K]> & string>;
}[keyof C & string];
