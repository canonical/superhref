/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../type-testing/expect.js";
import type { AnyCodec, Codec } from "./codec.js";
import type {
  ActionsOf,
  CodecsOf,
  ConfigValue,
  OwnedKey,
  SuperhrefParsed,
  SuperhrefPatchInput,
} from "./config.js";
import type { Empty } from "./util.js";

// A config: one root key, one section with two codecs.
type Config = {
  panel: AnyCodec;
  bugs: { severity: AnyCodec; page: AnyCodec };
};

// `OwnedKey` keeps root keys unchanged and expands sections into dotted
// `section.codec` keys.
type _ownedKeys = ExpectTrue<
  Equal<OwnedKey<Config>, "panel" | "bugs.severity" | "bugs.page">
>;

// Negative: the bare section name is NOT an owned key; only its dotted
// members are.
type _noBareSection = ExpectFalse<Extends<"bugs", OwnedKey<Config>>>;

// A config with only root keys yields exactly those keys.
type _rootsOnly = ExpectTrue<
  Equal<OwnedKey<{ a: AnyCodec; b: AnyCodec }>, "a" | "b">
>;

type Str = Codec<string>;
type Num = Codec<number>;
type WithActions = { codecs: { page: Num }; actions: { go: () => string } };

// A section with actions yields its codecs map.
type _codecsOfSectionWithActions = ExpectTrue<
  Equal<CodecsOf<WithActions>, { page: Num }>
>;
// A bare section is its own codecs map.
type _codecsOfBareSection = ExpectTrue<
  Equal<CodecsOf<{ id: Str }>, { id: Str }>
>;
// A root codec has no codecs map, so the fallback is `never`.
type _codecsOfRootCodecIsNever = ExpectTrue<Equal<CodecsOf<Str>, never>>;

// A section with actions yields its action map.
type _actionsOfSectionWithActions = ExpectTrue<
  Equal<ActionsOf<WithActions>, { go: () => string }>
>;
// Having no actions is a real state for a bare section, so the fallback is `Empty`.
type _actionsOfBareSectionIsEmpty = ExpectTrue<
  Equal<ActionsOf<{ id: Str }>, Empty>
>;
// A `never` fallback would collapse every bare section handle to `never`.
type _actionsOfBareSectionIsNotNever = ExpectFalse<
  Equal<ActionsOf<{ id: Str }>, never>
>;

// A root codec is a valid config value.
type _rootCodecIsConfigValue = ExpectTrue<Extends<Str, ConfigValue>>;
// A bare codecs map is a valid config value.
type _bareSectionIsConfigValue = ExpectTrue<Extends<{ id: Str }, ConfigValue>>;
// A section with actions is a valid config value.
type _sectionWithActionsIsConfigValue = ExpectTrue<
  Extends<WithActions, ConfigValue>
>;
// A plain value is not a config value.
type _plainValueIsNotConfigValue = ExpectFalse<Extends<5, ConfigValue>>;
// An object whose properties are not codecs is not a config value.
type _looseObjectIsNotConfigValue = ExpectFalse<
  Extends<{ id: number }, ConfigValue>
>;

// The parsed shape of a config: one root codec, one section.
type State = SuperhrefParsed<{ panel: Num; bugs: { severity: Str } }>;
// A root key parses to its codec's value type.
type _parsedRootValue = ExpectTrue<Equal<State["panel"], number>>;
// A section key parses to a nested object of its codecs' value types.
type _parsedSectionValue = ExpectTrue<Equal<State["bugs"]["severity"], string>>;
// The parsed shape has exactly the config's keys, with no extras.
type _parsedKeys = ExpectTrue<Equal<keyof State, "panel" | "bugs">>;

// A patch input rejects wrong value shapes: a wrong root value, a wrong
// section leaf, and a section payload placed on a root codec.
type PatchInput = SuperhrefPatchInput<{ panel: Str; bugs: { page: Num } }>;
type _wrongRootValue = ExpectFalse<Extends<{ panel: 3 }, PatchInput>>;
type _wrongSectionValue = ExpectFalse<
  Extends<{ bugs: { page: "two" } }, PatchInput>
>;
type _sectionPayloadOnRoot = ExpectFalse<
  Extends<{ panel: { page: 2 } }, PatchInput>
>;
