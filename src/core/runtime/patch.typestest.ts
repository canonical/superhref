/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { numCodec } from "../../codecs/number.js";
import { strCodec } from "../../codecs/string.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../type-testing/expect.js";
import type { SuperhrefPatchInput } from "../types/config.js";
import { patch } from "./patch.js";

const config = {
  panel: strCodec({ default: "all" }),
  bugs: { page: numCodec({ default: 1 }), q: strCodec() },
};
const ctx = { config, actions: {} };
const url = new URL("https://x.test/");

// Any subset of keys may be patched; `null` deletes a key, `undefined` is a
// no-op, and a section takes a nested partial (or `null` to clear it whole).
const next = patch(ctx, url, {});
patch(ctx, url, { panel: "bugs" });
patch(ctx, url, { panel: undefined });
patch(ctx, url, { panel: null, bugs: { page: 2 } });
patch(ctx, url, { bugs: null });

// The result is a new URL.
type _returnsUrl = ExpectTrue<Equal<typeof next, URL>>;

// A wrong value shape is not assignable to the patch input...
type Input = SuperhrefPatchInput<typeof config>;
type _wrongRootValue = ExpectFalse<Extends<{ panel: 3 }, Input>>;
type _wrongSectionValue = ExpectFalse<
  Extends<{ bugs: { page: "two" } }, Input>
>;
type _sectionPayloadOnRoot = ExpectFalse<
  Extends<{ panel: { page: 2 } }, Input>
>;
// ...and a key the config doesn't own is rejected. That's an excess-property
// check, which exists only at a literal call site — no `Extends` equivalent.
// @ts-expect-error a key the config doesn't own is rejected
patch(ctx, url, { rogue: "x" });
