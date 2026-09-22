/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import * as z from "zod";

import { zodCodec } from "../../codecs/zod.js";
import type { Equal, ExpectTrue } from "../../type-testing/expect.js";
import { parse } from "./parse.js";

const PageSchema = z.codec(z.string(), z.number(), {
  decode: (value) => Number(value),
  encode: (value) => String(value),
});

// One schema with the value shapes parse distinguishes: root codecs (with and
// without a default) and a section.
const schema = {
  panel: zodCodec(z.enum(["open", "closed"]), { default: "closed" }),
  q: zodCodec(z.string()),
  bugs: {
    page: zodCodec(PageSchema, { default: 1 }),
    severity: zodCodec(z.string()),
  },
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
