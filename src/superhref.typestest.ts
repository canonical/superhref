/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import * as z from "zod";

import { zodCodec } from "./codecs/zod.js";
import { withActions } from "./patterns/with-actions.js";
import { superhref } from "./superhref.js";
import type { Equal, ExpectTrue } from "./type-testing/expect.js";

const PageSchema = z.codec(z.string(), z.number(), {
  decode: (value) => Number(value),
  encode: (value) => String(value),
});

const QueryParamsSchema = superhref(
  {
    panel: zodCodec(z.enum(["open", "closed"]), { default: "closed" }),
    bugs: withActions(
      {
        page: zodCodec(PageSchema, { default: 1 }),
        q: zodCodec(z.string()),
      },
      { jump: (patch, _state, page: number) => patch({ page }) },
    ),
  },
  {
    // A top level action's `patch` and `state` are typed from the schema with
    // no annotation.
    actions: { reset: (patch) => patch({ panel: null, bugs: null }) },
  },
);
const url = new URL("https://x.test/");

// `parse` returns the schema's shape: typed roots, nested sections
const state = QueryParamsSchema.parse(url);
type _parsedRoot = ExpectTrue<
  Equal<(typeof state)["panel"], "open" | "closed">
>;
type _parsedKeys = ExpectTrue<Equal<keyof typeof state, "panel" | "bugs">>;

// `bind` carries both the schema and the action map through the factory.
const queryParams = QueryParamsSchema.bind(url);
type _queryParamsKeys = ExpectTrue<
  Equal<
    keyof typeof queryParams,
    "panel" | "bugs" | "reset" | "patch" | "clear" | "set"
  >
>;
type _queryParamsAction = ExpectTrue<
  Equal<typeof queryParams.reset, () => string>
>;
type _queryParamsSectionAction = ExpectTrue<
  Equal<typeof queryParams.bugs.jump, (page: number) => string>
>;
