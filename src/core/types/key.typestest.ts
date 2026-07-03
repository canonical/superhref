/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ExpectFalse, ExpectTrue } from "../../type-testing/expect.js";
import type { ValidKey } from "./key.js";

// A valid key is a letter followed by letters, digits, or the characters
// `_`, `~`, and `-`.
type _plain = ExpectTrue<ValidKey<"page">>;
type _singleLetter = ExpectTrue<ValidKey<"q">>;
type _fullCharset = ExpectTrue<ValidKey<"Sort_by-2~x">>;

// The first character must be a letter.
type _leadingDigit = ExpectFalse<ValidKey<"9lives">>;
type _leadingUnderscore = ExpectFalse<ValidKey<"_page">>;
type _empty = ExpectFalse<ValidKey<"">>;

// "." is the section separator, so it can't appear in a codec key.
type _dotted = ExpectFalse<ValidKey<"bugs.page">>;
type _space = ExpectFalse<ValidKey<"a b">>;
