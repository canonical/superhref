/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";
import * as z from "zod";

import { superhref } from "../superhref.js";
import { zodCodec } from "./zod.js";

const RawPageSchema = z.codec(z.string().regex(/^[1-9]\d*$/), z.int().min(1), {
  decode: (value) => Number(value),
  encode: (value) => String(value),
});
const PageSchema = z.compile(RawPageSchema);

describe("zodCodec", () => {
  it("uses compiled Zod schemas to parse and serialize URL values", () => {
    const codec = zodCodec(PageSchema);

    expect(codec.parse("12")).toBe(12);
    expect(codec.serialize(12)).toBe("12");
    expect(codec.serialize(null)).toBeNull();
  });

  it("keeps compiled and uncompiled schema behavior equivalent", () => {
    const raw = zodCodec(RawPageSchema);
    const compiled = zodCodec(PageSchema);

    for (const input of ["12", "not-a-page"]) {
      expect(compiled.parse(input)).toBe(raw.parse(input));
    }
    expect(compiled.serialize(12)).toBe(raw.serialize(12));
  });

  it("falls back when Zod's synchronous parse path throws", () => {
    const AsyncCheckSchema = z.string().refine(async () => true);
    const DirectParams = superhref({ q: AsyncCheckSchema });

    expect(zodCodec(AsyncCheckSchema).parse("value")).toBeNull();
    expect(
      DirectParams.parse(new URL("https://example.test/?q=value")),
    ).toEqual({ q: null });
  });

  it("surfaces Zod's error for unidirectional transforms", () => {
    const codec = zodCodec(z.string().transform((value) => value.length));
    let thrown: unknown;

    try {
      codec.serialize(3);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toMatchObject({ name: "ZodEncodeError" });
  });

  it("coerces absent and invalid input to the configured fallback", () => {
    const nullable = zodCodec(PageSchema);
    const withDefault = zodCodec(PageSchema, { default: 1 });

    expect(nullable.parse(null)).toBeNull();
    expect(nullable.parse("not-a-page")).toBeNull();
    expect(withDefault.parse(null)).toBe(1);
    expect(withDefault.parse("not-a-page")).toBe(1);
  });

  it("retains Zod validation when encoding application values", () => {
    const codec = zodCodec(PageSchema);

    expect(() => codec.serialize(0)).toThrow(z.ZodError);
  });

  it("validates the configured default when the codec is constructed", () => {
    expect(() => zodCodec(PageSchema, { default: 0 })).toThrow(z.ZodError);
  });

  it("accepts Zod schemas directly at root and section leaves", () => {
    const QueryParams = superhref({
      panel: z.compile(z.enum(["overview", "version", "bugs"])),
      page: PageSchema,
      version: { id: z.string() },
    });

    expect(
      QueryParams.parse(
        new URL("https://example.test/?panel=bugs&page=3&version.id=1.2.3"),
      ),
    ).toEqual({ panel: "bugs", page: 3, version: { id: "1.2.3" } });
    expect(
      QueryParams.parse(
        new URL("https://example.test/?panel=invalid&page=invalid"),
      ),
    ).toEqual({ panel: null, page: null, version: { id: null } });

    const patched = QueryParams.patch(new URL("https://example.test/"), {
      panel: "version",
      page: 4,
      version: { id: "2.0" },
    });
    expect(patched.search).toBe("?panel=version&page=4&version.id=2.0");
    expect(QueryParams.parse(patched).page).toBe(4);

    expect(QueryParams.patch(patched, { panel: null }).search).toBe(
      "?page=4&version.id=2.0",
    );
  });

  it("works end to end as root and section codecs", () => {
    const QueryParams = superhref({
      page: zodCodec(PageSchema, { default: 1 }),
      filters: {
        status: zodCodec(z.compile(z.enum(["open", "closed"]))),
      },
    });
    const input = new URL(
      "https://example.test/?page=bad&filters.status=invalid",
    );

    expect(QueryParams.parse(input)).toEqual({
      page: 1,
      filters: { status: null },
    });

    const patched = QueryParams.patch(input, {
      page: 3,
      filters: { status: "open" },
    });
    expect(patched.search).toBe("?page=3&filters.status=open");
    expect(QueryParams.parse(patched)).toEqual({
      page: 3,
      filters: { status: "open" },
    });
  });
});
