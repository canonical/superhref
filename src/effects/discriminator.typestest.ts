/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { enumCodec } from "../codecs/enum.js";
import type { Codec } from "../core/types/codec.js";
import type { OwnedKey } from "../core/types/config.js";
import type { SuperhrefEffect } from "../core/types/effect.js";
import { superhref } from "../superhref.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../type-testing/expect.js";
import { discriminatorEffect } from "./discriminator.js";

// The discriminating key keeps its literal type, root or dotted, so it can be
// checked against the config's owned keys instead of widening to `string`.
const eff = discriminatorEffect("panel", ["bugs", "prs"]);
type _keyKept = ExpectTrue<Equal<typeof eff, SuperhrefEffect<"panel">>>;
const dotted = discriminatorEffect("bugs.page", ["a"]);
type _dottedKeyKept = ExpectTrue<
  Equal<typeof dotted, SuperhrefEffect<"bugs.page">>
>;

// `requires` surfaces the same literal at runtime.
type _requires = ExpectTrue<
  Equal<typeof eff.requires, readonly "panel"[] | undefined>
>;

// A precisely keyed effect fits wherever any effect is accepted (the
// runtime's effects array)...
type _narrowToWide = ExpectTrue<
  Extends<SuperhrefEffect<"panel">, SuperhrefEffect>
>;
// ...but a loose effect, or one with the wrong key, doesn't satisfy a precise
// requirement.
type _wideToNarrow = ExpectFalse<
  Extends<SuperhrefEffect, SuperhrefEffect<"panel">>
>;
type _wrongKey = ExpectFalse<
  Extends<SuperhrefEffect<"typo">, SuperhrefEffect<"panel">>
>;

// Through the factory, `options.effects` accepts an effect keyed by one of
// the config's own keys, root or dotted, and nothing else.
superhref(
  { panel: enumCodec(["a", "b"]), bugs: { severity: enumCodec(["a", "b"]) } },
  { effects: [discriminatorEffect("panel", ["a", "b"])] },
);
type Owned = OwnedKey<{
  panel: Codec<string>;
  bugs: { severity: Codec<string> };
}>;
type _ownedKeyOk = ExpectTrue<
  Extends<SuperhrefEffect<"panel" | "bugs.severity">, SuperhrefEffect<Owned>>
>;
type _typoKeyRejected = ExpectFalse<
  Extends<SuperhrefEffect<"panl">, SuperhrefEffect<Owned>>
>;
