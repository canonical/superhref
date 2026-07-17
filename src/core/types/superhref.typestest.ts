/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import type { BoundSuperhref } from "./bound.js";
import type { Codec } from "./codec.js";
import type { SuperhrefParsed, SuperhrefPatch } from "./schema.js";
import type { Superhref } from "./superhref.js";

type Cfg = { panel: Codec<"open" | "closed">; bugs: { page: Codec<number> } };
type Actions = {
  reset: (
    patch: SuperhrefPatch<Cfg>,
    state: SuperhrefParsed<Cfg>,
    hard: boolean,
  ) => string;
};
type Sh = Superhref<Cfg, Actions>;

type _parseResult = ExpectTrue<
  Equal<ReturnType<Sh["parse"]>, SuperhrefParsed<Cfg>>
>;
type _patchReturnsUrl = ExpectTrue<Equal<ReturnType<Sh["patch"]>, URL>>;
type _clearReturnsUrl = ExpectTrue<Equal<ReturnType<Sh["clear"]>, URL>>;
type _bindResult = ExpectTrue<
  Equal<ReturnType<Sh["bind"]>, BoundSuperhref<Cfg, Actions>>
>;
