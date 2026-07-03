/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// Inference through the whole factory: schema in, precisely typed parse and
// bind out. The instance shape itself is pinned in
// `core/types/superhref.typestest.ts` and the validators next to their types
// (validate/schema.typestest.ts, validate/actions.typestest.ts,
// validate/section.typestest.ts); this file pins what the factory infers.

import { enumCodec } from "./codecs/enum.js";
import { numCodec } from "./codecs/number.js";
import { strCodec } from "./codecs/string.js";
import { discriminatorEffect } from "./effects/discriminator.js";
import { withActions } from "./patterns/with-actions.js";
import { superhref } from "./superhref.js";
import type { Equal, ExpectTrue } from "./type-testing/expect.js";

const sh = superhref(
  {
    panel: enumCodec(["open", "closed"], { default: "closed" }),
    bugs: withActions(
      { page: numCodec({ default: 1 }), q: strCodec() },
      { jump: (patch, _state, page: number) => patch({ page }) },
    ),
  },
  {
    effects: [discriminatorEffect("panel", ["bugs"])],
    // A top level action's `patch` and `state` are typed from the schema with
    // no annotation.
    actions: { reset: (patch) => patch({ panel: null, bugs: null }) },
  },
);
const url = new URL("https://x.test/");

// `parse` returns the schema's shape: typed roots, nested sections, no extras.
const state = sh.parse(url);
type _parsedRoot = ExpectTrue<
  Equal<(typeof state)["panel"], "open" | "closed">
>;
type _parsedKeys = ExpectTrue<Equal<keyof typeof state, "panel" | "bugs">>;

// `bind` carries both the schema and the action map through the factory.
const bound = sh.bind(url);
type _boundKeys = ExpectTrue<
  Equal<
    keyof typeof bound,
    "panel" | "bugs" | "reset" | "patch" | "clear" | "set"
  >
>;
type _boundAction = ExpectTrue<Equal<typeof bound.reset, () => string>>;
type _boundSectionAction = ExpectTrue<
  Equal<typeof bound.bugs.jump, (page: number) => string>
>;
