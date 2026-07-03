/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import { innerKey, sectionPrefix, splitKey } from "./keys.js";

// innerKey composes the precise dotted literal, the single definition that
// OwnedKey reuses.
const composed = innerKey("bugs", "page");
type _innerKey = ExpectTrue<Equal<typeof composed, "bugs.page">>;

// splitKey resolves a dotted literal to a labelled [section, codec] tuple...
const splitDotted = splitKey("bugs.page");
type _splitDotted = ExpectTrue<
  Equal<typeof splitDotted, [section: "bugs", codec: "page"]>
>;
// ...a root key (no separator) to null...
const splitRoot = splitKey("panel");
type _splitRoot = ExpectTrue<Equal<typeof splitRoot, null>>;
// ...and a dynamic string widens rather than collapsing to null.
const dynamic: string = "x";
const splitDynamic = splitKey(dynamic);
type _splitDynamic = ExpectTrue<
  Equal<typeof splitDynamic, [section: string, codec: string] | null>
>;

// sectionPrefix infers the section for a dotted key, and keeps a root key as-is.
const prefixDotted = sectionPrefix("bugs.page");
type _prefixDotted = ExpectTrue<Equal<typeof prefixDotted, "bugs">>;
const prefixRoot = sectionPrefix("panel");
type _prefixRoot = ExpectTrue<Equal<typeof prefixRoot, "panel">>;
