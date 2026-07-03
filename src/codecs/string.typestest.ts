/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// NOTE: this exercises `strCodec` (introduced in the codecs PR, inherited here —
// see the placement note in number.typestest.ts).

import type { Codec } from "../core/types/codec.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../type-testing/expect.js";
import { strCodec } from "./string.js";

// A provided `default` narrows the parsed value to `string`.
const withDefault = strCodec({ default: "all" });
type _withDefault = ExpectTrue<Equal<typeof withDefault, Codec<string>>>;

// No `default` → the value can be absent.
const noDefault = strCodec();
type _noDefault = ExpectTrue<
  Equal<typeof noDefault, Codec<string | undefined>>
>;

// `serialize` takes the codec's value type — absence is `undefined`, never
// `null` (`null` is patch syntax for deletion, not a codec value).
type SerializeArg = Parameters<(typeof noDefault)["serialize"]>[0];
type _absenceOk = ExpectTrue<Extends<undefined, SerializeArg>>;
type _nullRejected = ExpectFalse<Extends<null, SerializeArg>>;
