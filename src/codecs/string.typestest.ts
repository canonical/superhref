/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codec } from "../core/types/codec.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../type-testing/expect.js";
import { strCodec } from "./string.js";

// With a `default` the parsed value is always a `string`.
const withDefault = strCodec({ default: "all" });
type _withDefault = ExpectTrue<Equal<typeof withDefault, Codec<string>>>;

// Without a `default` the value can be null.
const noDefault = strCodec();
type _noDefault = ExpectTrue<Equal<typeof noDefault, Codec<string | null>>>;

type SerializeArg = Parameters<(typeof noDefault)["serialize"]>[0];
type _stringOk = ExpectTrue<Extends<string, SerializeArg>>;
type _nullOk = ExpectTrue<Extends<null, SerializeArg>>;
type _undefinedRejected = ExpectFalse<Extends<undefined, SerializeArg>>;
