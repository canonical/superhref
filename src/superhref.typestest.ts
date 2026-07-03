/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// End-to-end inference through the factory: config in, precisely-typed
// parse/patch/bind out. The validators themselves are pinned next to their
// types (validate/config.typestest.ts, validate/actions.typestest.ts,
// validate/section.typestest.ts); this file pins the assembled API.

import { enumCodec } from "./codecs/enum.js";
import { numCodec } from "./codecs/number.js";
import { strCodec } from "./codecs/string.js";
import { withActions } from "./patterns/with-actions.js";
import { superhref } from "./superhref.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "./type-testing/expect.js";

const sh = superhref(
  {
    panel: enumCodec(["open", "closed"], { default: "closed" }),
    bugs: withActions(
      { page: numCodec({ default: 1 }), q: strCodec() },
      { jump: (patch, _state, page: number) => patch({ page }) },
    ),
  },
  {
    // A top-level action's `patch` and `state` are typed from the config with
    // no annotation.
    actions: { reset: (patch) => patch({ panel: null, bugs: null }) },
  },
);
const url = new URL("https://x.test/");

// `parse` returns the config's shape: typed roots, nested sections, no extras.
const state = sh.parse(url);
type _parsedRoot = ExpectTrue<
  Equal<(typeof state)["panel"], "open" | "closed">
>;
type _parsedSection = ExpectTrue<Equal<(typeof state)["bugs"]["page"], number>>;
type _parsedKeys = ExpectTrue<Equal<keyof typeof state, "panel" | "bugs">>;

// `patch` and `clear` take and return a URL (the bound versions return strings).
const patched = sh.patch(url, { panel: "open", bugs: { q: "crash" } });
type _patchReturnsUrl = ExpectTrue<Equal<typeof patched, URL>>;
type _clearReturnsUrl = ExpectTrue<
  Equal<ReturnType<(typeof sh)["clear"]>, URL>
>;
// A key the config doesn't own is rejected. That's an excess-property check,
// which exists only at a literal call site — no `Extends` equivalent.
// @ts-expect-error a key the config doesn't own is rejected
sh.patch(url, { rogue: 1 });

// `bind` carries both the config and the action map through the factory.
const bound = sh.bind(url);
type _boundKeys = ExpectTrue<
  Equal<
    keyof typeof bound,
    "panel" | "bugs" | "reset" | "patch" | "clear" | "set"
  >
>;
type _boundValue = ExpectTrue<Equal<typeof bound.panel, "open" | "closed">>;
type _boundAction = ExpectTrue<Equal<typeof bound.reset, () => string>>;
type _boundSectionAction = ExpectTrue<
  Equal<typeof bound.bugs.jump, (page: number) => string>
>;

// The bound `set` keeps one overload per key through the factory: a literal
// key with its own value type compiles, and no signature in the overload set
// accepts a wrong pairing.
bound.set("panel", "open");
bound.bugs.set("page", 2);
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
type _unknownSectionKey = ExpectFalse<
  Extends<SectionSet, (key: "nope", value: never) => string>
>;
