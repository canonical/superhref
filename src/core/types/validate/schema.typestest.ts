/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../../type-testing/expect.js";
import type { Codec } from "../codec.js";
import type { ValidateSchemaKeys } from "./schema.js";

type Num = Codec<number>;

// One schema carrying every key class at once: each key is checked on its own,
// so the bad keys must not degrade the good keys' types.
type Checked = ValidateSchemaKeys<{
  panel: Num;
  bugs: { page: Num };
  set: Num;
  "a.b": Num;
  broken: { "x.y": Num };
}>;

// A good root codec and a clean section keep their precise types.
type _rootKept = ExpectTrue<Equal<Checked["panel"], Num>>;
type _sectionKept = ExpectTrue<Equal<Checked["bugs"], { page: Num }>>;

// A reserved root key becomes its error string (which no codec can satisfy).
type _reservedRoot = ExpectTrue<
  Equal<Checked["set"], `superhref: schema key "set" is reserved`>
>;
type _reservedRejectsCodec = ExpectFalse<Extends<Num, Checked["set"]>>;

// An invalid key and a section with its own problem get their messages.
type _invalidRoot = ExpectTrue<
  Equal<
    Checked["a.b"],
    `superhref: schema key "a.b" is not a valid URL key (letters/digits/_~- only, must start with a letter; "." is reserved)`
  >
>;
type _sectionProblem = ExpectTrue<
  Equal<
    Checked["broken"],
    `superhref: section "broken" has an invalid codec key "x.y"`
  >
>;
