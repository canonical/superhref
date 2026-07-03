/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// NOTE: this exercises `numCodec` (introduced in the codecs PR and inherited
// here). If the harness lands one PR lower, codec type tests like this belong
// beside the codecs.

import type { Codec } from "../core/types/codec.js";
import type { Equal, ExpectTrue } from "../type-testing/expect.js";
import { numCodec } from "./number.js";

// With a `default` the parsed value is always a `number`.
const withDefault = numCodec({ default: 1 });
type _withDefault = ExpectTrue<Equal<typeof withDefault, Codec<number>>>;

// Without a `default` the value can be absent.
const noDefault = numCodec();
type _noDefault = ExpectTrue<
  Equal<typeof noDefault, Codec<number | undefined>>
>;

// Bounds alone don't add a default, so the value stays optional.
const boundsOnly = numCodec({ min: 0, max: 10 });
type _boundsOnly = ExpectTrue<
  Equal<typeof boundsOnly, Codec<number | undefined>>
>;
