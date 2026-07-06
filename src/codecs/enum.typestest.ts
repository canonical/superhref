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
import { enumCodec } from "./enum.js";

// The value type is the literal union of the given values...
const plain = enumCodec(["x", "y"]);
type _plain = ExpectTrue<Equal<typeof plain, Codec<"x" | "y" | undefined>>>;

// ...and a `default` removes `undefined` from the union.
const withDefault = enumCodec(["x", "y"], { default: "x" });
type _withDefault = ExpectTrue<Equal<typeof withDefault, Codec<"x" | "y">>>;

type SerializeArg = Parameters<(typeof plain)["serialize"]>[0];
type _memberOk = ExpectTrue<Extends<"x", SerializeArg>>;
type _outsiderRejected = ExpectFalse<Extends<"z", SerializeArg>>;
