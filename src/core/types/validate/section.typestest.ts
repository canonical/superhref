/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../../type-testing/expect.js";
import type { Codec } from "../codec.js";
import type {
  SectionHasProblem,
  SectionMsg,
  ValidateCodecs,
} from "./section.js";

type Num = Codec<number>;
type Str = Codec<string>;

// ValidateCodecs keeps a valid key's codec...
type Checked = ValidateCodecs<{ page: Num; "a.b": Num; patch: Num }>;
type _validKept = ExpectTrue<Equal<Checked["page"], Num>>;
// ...replaces an invalid key's value with its error string type...
type _invalidFlagged = ExpectTrue<
  Equal<
    Checked["a.b"],
    `superhref: codec key "a.b" is not a valid URL key (letters/digits/_~- only, must start with a letter; "." is reserved)`
  >
>;
// ...and flags a reserved key with a message no codec can satisfy.
type _reservedFlagged = ExpectTrue<Extends<Checked["patch"], string>>;
type _reservedRejectsCodec = ExpectFalse<Extends<Num, Checked["patch"]>>;

// A section is clean when every codec key is valid and no name meets a
// reserved name or an action name.
type _cleanBare = ExpectFalse<SectionHasProblem<{ page: Num; q: Str }>>;
type _cleanWithActions = ExpectFalse<
  SectionHasProblem<{ codecs: { page: Num }; actions: { go: () => string } }>
>;

// Each problem class is caught: a codec key colliding with an action name, a
// reserved codec key, a reserved action name, and invalid key syntax.
type _codecActionClash = ExpectTrue<
  SectionHasProblem<{ codecs: { page: Num }; actions: { page: () => string } }>
>;
type _reservedCodecKey = ExpectTrue<SectionHasProblem<{ set: Num }>>;
type _reservedActionName = ExpectTrue<
  SectionHasProblem<{
    codecs: { page: Num };
    actions: { patch: () => string };
  }>
>;
type _invalidCodecKey = ExpectTrue<SectionHasProblem<{ "a.b": Num }>>;

// SectionMsg is `never` for a clean section, names the section and the
// offending key otherwise, and reports the invalid key problem first when
// several apply.
type Cfg = {
  clean: { page: Num };
  clash: { codecs: { page: Num }; actions: { page: () => string } };
  both: { codecs: { "a.b": Num }; actions: { set: () => string } };
};
type _cleanMsg = ExpectTrue<Equal<SectionMsg<Cfg, "clean">, never>>;
type _clashMsg = ExpectTrue<
  Equal<
    SectionMsg<Cfg, "clash">,
    `superhref: section "clash" has a codec key and an action named "page"`
  >
>;
type _syntaxFirst = ExpectTrue<
  Equal<
    SectionMsg<Cfg, "both">,
    `superhref: section "both" has an invalid codec key "a.b"`
  >
>;
