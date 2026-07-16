/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
} from "../../type-testing/expect.js";
import type { ValidKey } from "../types/validate/key.js";
import type {
  ReservedActionName,
  ReservedCodecKey,
} from "../types/validate/section.js";
import type { KeySep } from "./keys.js";
import type {
  RESERVED_ACTION_NAMES,
  RESERVED_CODEC_KEYS,
} from "./schema-guard.js";

type _reservedCodecKeysMatchTypeLevel = ExpectTrue<
  Equal<(typeof RESERVED_CODEC_KEYS)[number], ReservedCodecKey>
>;
type _reservedActionNamesMatchTypeLevel = ExpectTrue<
  Equal<(typeof RESERVED_ACTION_NAMES)[number], ReservedActionName>
>;
type _separatorIsNeverAValidKeyChar = ExpectFalse<ValidKey<`a${KeySep}b`>>;
