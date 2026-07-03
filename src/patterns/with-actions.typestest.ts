/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { numCodec } from "../codecs/number.js";
import { strCodec } from "../codecs/string.js";
import type { Codec, Parsed } from "../core/types/codec.js";
import type { SectionActionMap, SectionPatch } from "../core/types/section.js";
import type { SectionActionCollisions } from "../core/types/validate/section.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../type-testing/expect.js";
import { withActions } from "./with-actions.js";

// `patch` and `state` are typed from the codecs, so actions need no
// annotations; extra parameters (like `q` here) stay on the action's type.
const bugs = withActions(
  { page: numCodec({ default: 1 }), q: strCodec() },
  {
    nextPage: (patch, state) => patch({ page: state.page + 1 }),
    search: (patch, _state, q: string) => patch({ q, page: null }),
  },
);

// The built section keeps the precise codec types...
type _codecKept = ExpectTrue<
  Equal<(typeof bugs)["codecs"]["page"], Codec<number>>
>;

// ...and the concrete action signatures: typed state, extra args, string
// result.
type Search = (typeof bugs)["actions"]["search"];
type _stateParam = ExpectTrue<
  Equal<Parameters<Search>[1], { page: number; q: string | undefined }>
>;
type _extraParam = ExpectTrue<Equal<Parameters<Search>[2], string>>;
type _result = ExpectTrue<Equal<ReturnType<Search>, string>>;

// The actions argument is checked against the action map AND the collision
// constraint: an action named after a codec key or the reserved patch/set
// can't satisfy the error-string slot the constraint puts at that name.
// (Bad codec keys themselves are pinned in validate/section.typestest.ts.)
type SectionCodecs = { page: Codec<number | undefined> };
type ActionsArg = SectionActionMap<Parsed<SectionCodecs>> &
  SectionActionCollisions<SectionCodecs>;
type _cleanActionOk = ExpectTrue<Extends<{ go: () => string }, ActionsArg>>;
type _codecNameClash = ExpectFalse<Extends<{ page: () => string }, ActionsArg>>;
type _reservedNameClash = ExpectFalse<
  Extends<{ set: () => string }, ActionsArg>
>;

// An action's `patch` takes this section's value types...
type PatchArg = Parameters<SectionPatch<Parsed<{ page: Codec<number> }>>>[0];
type _patchValueOk = ExpectTrue<Extends<{ page: 2 }, PatchArg>>;
type _patchWrongValue = ExpectFalse<Extends<{ page: "one" }, PatchArg>>;
// ...and rejects keys outside the section. That's an excess property check,
// which exists only at a literal call site, so there is no `Extends`
// equivalent.
withActions(
  { page: numCodec({ default: 1 }) },
  {
    // @ts-expect-error an action's `patch` accepts only this section's keys
    jump: (patch) => patch({ rogue: 2 }),
  },
);
