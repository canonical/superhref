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
import { numCodec } from "./number.js";

// With a `default` the parsed value is always a `number`.
const withDefault = numCodec({ default: 1 });
type _withDefault = ExpectTrue<Equal<typeof withDefault, Codec<number>>>;

// Without a `default` the value can be absent.
const noDefault = numCodec();
type _noDefault = ExpectTrue<Equal<typeof noDefault, Codec<number | null>>>;

// Bounds alone don't add a default, so the value stays optional.
const boundsOnly = numCodec({ min: 0, max: 10 });
type _boundsOnly = ExpectTrue<Equal<typeof boundsOnly, Codec<number | null>>>;

type SerializeArg = Parameters<(typeof noDefault)["serialize"]>[0];
type _numberOk = ExpectTrue<Extends<number, SerializeArg>>;
type _nullOk = ExpectTrue<Extends<null, SerializeArg>>;
type _undefinedRejected = ExpectFalse<Extends<undefined, SerializeArg>>;
type _stringRejected = ExpectFalse<Extends<"3", SerializeArg>>;
