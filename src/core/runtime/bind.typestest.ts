/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// `BoundSuperhref` and `SectionHandle` are intersections wrapped in `Pretty`
// and `set` is an overload set, so the bound object is asserted by usage
// (leaf types, key sets, and accepted or rejected calls) rather than by an
// `Equal` over the whole shape.

import { enumCodec } from "../../codecs/enum.js";
import { numCodec } from "../../codecs/number.js";
import { strCodec } from "../../codecs/string.js";
import { withActions } from "../../patterns/with-actions.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../type-testing/expect.js";
import type { SuperhrefParsed, SuperhrefPatch } from "../types/config.js";
import { bind } from "./bind.js";

// Roots (with and without a default), a section with actions, a bare section.
const config = {
  panel: enumCodec(["open", "closed"], { default: "closed" }),
  q: strCodec(),
  bugs: withActions(
    { page: numCodec({ default: 1 }), severity: strCodec() },
    { jump: (patch, _state, page: number) => patch({ page }) },
  ),
  filters: { tag: strCodec() },
};
type Cfg = typeof config;

const bound = bind(
  {
    config,
    actions: {
      reset: (
        patch: SuperhrefPatch<Cfg>,
        _state: SuperhrefParsed<Cfg>,
        hard: boolean,
      ) => patch(hard ? { q: null, panel: null } : { q: null }),
    },
  },
  new URL("https://x.test/"),
);

// The bound object exposes exactly the roots, sections, actions, and methods.
type _boundKeys = ExpectTrue<
  Equal<
    keyof typeof bound,
    "panel" | "q" | "bugs" | "filters" | "reset" | "patch" | "clear" | "set"
  >
>;
type _handleKeys = ExpectTrue<
  Equal<keyof typeof bound.bugs, "page" | "severity" | "jump" | "patch" | "set">
>;

// Root values keep their codec value types.
type _root = ExpectTrue<Equal<typeof bound.panel, "open" | "closed">>;
type _optionalRoot = ExpectTrue<Equal<typeof bound.q, string | undefined>>;

// Section values are read straight off the handle, typed per codec.
type _handleValue = ExpectTrue<Equal<typeof bound.bugs.page, number>>;
type _bareHandleValue = ExpectTrue<
  Equal<typeof bound.filters.tag, string | undefined>
>;

// Bound actions lose their (patch, state) prefix and keep the caller args.
type _sectionAction = ExpectTrue<
  Equal<typeof bound.bugs.jump, (page: number) => string>
>;
type _topAction = ExpectTrue<
  Equal<typeof bound.reset, (hard: boolean) => string>
>;
type _clear = ExpectTrue<Equal<typeof bound.clear, () => string>>;

// `patch` takes a nested partial and returns the new search string.
const patched = bound.patch({ q: "crash", bugs: { page: 2 } });
type _patchResult = ExpectTrue<Equal<typeof patched, string>>;
// A key the config doesn't own is rejected. That's an excess property check,
// which exists only at a literal call site, so there is no `Extends`
// equivalent.
// @ts-expect-error a key the config doesn't own is rejected
bound.patch({ bogus: 1 });

// `set` pairs each key with its own value type, `null` included...
bound.set("panel", "open");
bound.set("q", null);
bound.bugs.set("page", 2);
bound.bugs.set("severity", "high");
// ...and no signature in the overload set accepts a wrong pairing: a mismatched
// value, a mixed key/value pair, or a key that isn't a root/section codec key.
type RootSet = typeof bound.set;
type SectionSet = typeof bound.bugs.set;
type _wrongRootValue = ExpectFalse<
  Extends<RootSet, (key: "panel", value: 3) => string>
>;
type _sectionKeyAtRoot = ExpectFalse<
  Extends<RootSet, (key: "bugs", value: never) => string>
>;
type _wrongSectionValue = ExpectFalse<
  Extends<SectionSet, (key: "page", value: "two") => string>
>;
type _mixedPair = ExpectFalse<
  Extends<SectionSet, (key: "severity", value: 2) => string>
>;
type _unknownSectionKey = ExpectFalse<
  Extends<SectionSet, (key: "nope", value: never) => string>
>;

// A section handle patches only its own keys (an excess property check
// again).
bound.bugs.patch({ page: null, severity: "low" });
// @ts-expect-error a key outside the section is rejected
bound.bugs.patch({ q: "x" });
