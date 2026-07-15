/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { enumCodec } from "../../codecs/enum.js";
import { numCodec } from "../../codecs/number.js";
import { strCodec } from "../../codecs/string.js";
import { withActions } from "../../patterns/with-actions.js";
import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import type { SuperhrefParsed, SuperhrefPatch } from "../types/config.js";
import { bind } from "./bind.js";

const schema = {
  panel: enumCodec(["open", "closed"], { default: "closed" }),
  q: strCodec(),
  bugs: withActions(
    { page: numCodec({ default: 1 }), severity: strCodec() },
    { jump: (patch, _state, page: number) => patch({ page }) },
  ),
  filters: { tag: strCodec() },
};
type Schema = typeof schema;

const bound = bind(
  {
    schema,
    actions: {
      reset: (
        patch: SuperhrefPatch<Schema>,
        _state: SuperhrefParsed<Schema>,
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
type _optionalRoot = ExpectTrue<Equal<typeof bound.q, string | null>>;

// Section values are read straight off the handle, typed per codec.
type _handleValue = ExpectTrue<Equal<typeof bound.bugs.page, number>>;
type _bareHandleValue = ExpectTrue<
  Equal<typeof bound.filters.tag, string | null>
>;

// Bound actions lose their (patch, state) prefix and keep the caller args.
type _sectionAction = ExpectTrue<
  Equal<typeof bound.bugs.jump, (page: number) => string>
>;
type _topAction = ExpectTrue<
  Equal<typeof bound.reset, (hard: boolean) => string>
>;
