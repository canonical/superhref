/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { enumCodec } from "../../codecs/enum.js";
import { numCodec } from "../../codecs/number.js";
import { strCodec } from "../../codecs/string.js";
import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import { parse } from "./parse.js";

// One schema with the value shapes parse distinguishes: root codecs (with and
// without a default) and a section.
const schema = {
  panel: enumCodec(["open", "closed"], { default: "closed" }),
  q: strCodec(),
  bugs: { page: numCodec({ default: 1 }), severity: strCodec() },
};
const parsed = parse({ schema, actions: {} }, new URL("https://x.test/"));

// A root codec parses to its value type; a default rules out `null`.
type _enumRoot = ExpectTrue<Equal<(typeof parsed)["panel"], "open" | "closed">>;
type _optionalRoot = ExpectTrue<Equal<(typeof parsed)["q"], string | null>>;

// A section parses to a nested object of its codecs' value types.
type _sectionDefaulted = ExpectTrue<
  Equal<(typeof parsed)["bugs"]["page"], number>
>;
type _sectionOptional = ExpectTrue<
  Equal<(typeof parsed)["bugs"]["severity"], string | null>
>;

// The result owns exactly the schema's keys
type _exactKeys = ExpectTrue<
  Equal<keyof typeof parsed, "panel" | "q" | "bugs">
>;
type _exactSectionKeys = ExpectTrue<
  Equal<keyof (typeof parsed)["bugs"], "page" | "severity">
>;
