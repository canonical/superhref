/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { numCodec } from "../../codecs/number.js";
import { strCodec } from "../../codecs/string.js";
import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import { patch } from "./patch.js";

const schema = {
  panel: strCodec({ default: "all" }),
  bugs: { page: numCodec({ default: 1 }), q: strCodec() },
};
const ctx = { schema, actions: {} };
const url = new URL("https://x.test/");

// Any subset of keys may be patched; `null` deletes a key, `undefined` leaves
// it unchanged, and a section takes a nested partial (or `null` to clear it
// whole).
const next = patch(ctx, url, {});
patch(ctx, url, { panel: "bugs" });
patch(ctx, url, { panel: undefined });
patch(ctx, url, { panel: null, bugs: { page: 2 } });
patch(ctx, url, { bugs: null });

// The result is a new URL.
type _returnsUrl = ExpectTrue<Equal<typeof next, URL>>;

// @ts-expect-error a key the schema doesn't own is rejected
patch(ctx, url, { rogue: "x" });
