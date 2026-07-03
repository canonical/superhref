/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../type-testing/expect.js";
import type { AnyCodec } from "./codec.js";
import type { OwnedKey } from "./config.js";

// A config: one root key, one section with two codecs.
type Config = {
  panel: AnyCodec;
  bugs: { severity: AnyCodec; page: AnyCodec };
};

// `OwnedKey` keeps root keys unchanged and expands sections into dotted
// `section.codec` keys.
type _ownedKeys = ExpectTrue<
  Equal<OwnedKey<Config>, "panel" | "bugs.severity" | "bugs.page">
>;

// Negative: the bare section name is NOT an owned key; only its dotted
// members are.
type _noBareSection = ExpectFalse<Extends<"bugs", OwnedKey<Config>>>;

// A config with only root keys yields exactly those keys.
type _rootsOnly = ExpectTrue<
  Equal<OwnedKey<{ a: AnyCodec; b: AnyCodec }>, "a" | "b">
>;
