/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import * as z from "zod";

import type { Codec } from "../core/types/codec.js";
import { superhref } from "../superhref.js";
import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../type-testing/expect.js";
import { zodCodec } from "./zod.js";

const StatusSchema = z.compile(z.enum(["open", "closed"]));
const nullableStatus = zodCodec(StatusSchema);
const defaultStatus = zodCodec(StatusSchema, { default: "open" });

type _nullableStatus = ExpectTrue<
  Equal<typeof nullableStatus, Codec<"open" | "closed" | null>>
>;
type _defaultStatus = ExpectTrue<
  Equal<typeof defaultStatus, Codec<"open" | "closed">>
>;

const PageSchema = z.compile(
  z.codec(z.string(), z.int().min(1), {
    decode: (value) => Number(value),
    encode: (value) => String(value),
  }),
);
const QueryParams = superhref({
  page: zodCodec(PageSchema, { default: 1 }),
  status: nullableStatus,
});
const state = QueryParams.parse(new URL("https://example.test/"));

type _pageOutput = ExpectTrue<Equal<(typeof state)["page"], number>>;
type _statusOutput = ExpectTrue<
  Equal<(typeof state)["status"], "open" | "closed" | null>
>;
type _invalidPagePatch = ExpectFalse<
  Extends<{ page: string }, Parameters<typeof QueryParams.patch>[1]>
>;

const DirectParams = superhref({
  page: PageSchema,
  status: StatusSchema,
  version: { id: z.string() },
});
const directState = DirectParams.parse(new URL("https://example.test/"));

type _directPageOutput = ExpectTrue<
  Equal<(typeof directState)["page"], number | null>
>;
type _directStatusOutput = ExpectTrue<
  Equal<(typeof directState)["status"], "open" | "closed" | null>
>;
type _directSectionOutput = ExpectTrue<
  Equal<(typeof directState)["version"]["id"], string | null>
>;
type _invalidDirectPatch = ExpectFalse<
  Extends<{ status: "draft" }, Parameters<typeof DirectParams.patch>[1]>
>;

// @ts-expect-error direct leaves must reverse-encode to URL text
superhref({ n: z.number() });
// @ts-expect-error direct leaves cannot use Zod optionality
superhref({ q: z.string().optional() });
// @ts-expect-error nested direct leaves cannot produce null themselves
superhref({ version: { id: z.string().nullable() } });

// @ts-expect-error the default must be a value produced by the schema
zodCodec(StatusSchema, { default: "draft" });
// @ts-expect-error the schema must encode its parsed value to a string
zodCodec(z.number());
// @ts-expect-error superhref owns absence; put defaults in zodCodec options
zodCodec(z.string().default("all"));
