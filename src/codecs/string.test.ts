/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { strCodec } from "./string.js";

describe("strCodec", () => {
  describe("parse", () => {
    it("returns the raw value verbatim (URLSearchParams already decoded it)", () => {
      expect(strCodec().parse("hello")).toBe("hello");
      expect(strCodec().parse("a b/c&d")).toBe("a b/c&d");
    });

    it("absence (null) yields the default, or undefined when there is none", () => {
      expect(strCodec().parse(null)).toBeUndefined();
      expect(strCodec({ default: "x" }).parse(null)).toBe("x");
    });

    it("an explicit empty value parses to '' — NOT the default", () => {
      // `?key=` is present-but-empty; only true absence (null) falls back to default.
      expect(strCodec().parse("")).toBe("");
      expect(strCodec({ default: "x" }).parse("")).toBe("");
    });
  });

  describe("serialize", () => {
    it("returns a non-empty string as-is", () => {
      expect(strCodec().serialize("hello")).toBe("hello");
      expect(strCodec().serialize("a b/c&d")).toBe("a b/c&d");
    });

    it("undefined serializes to null (omit the key)", () => {
      expect(strCodec().serialize(undefined)).toBeNull();
    });

    it("empty string omits with no default, but writes explicitly when one is provided", () => {
      // No default → "" and absence collapse to the same thing, so omit.
      expect(strCodec().serialize("")).toBeNull();
      // A provided default → write "" explicitly so a re-parse can't resurrect it.
      expect(strCodec({ default: "x" }).serialize("")).toBe("");
    });

    it("an explicit empty-string default is honored — '' is written, not omitted", () => {
      expect(strCodec({ default: "" }).serialize("")).toBe("");
    });
  });

  it("exposes its default for read-side fallback", () => {
    expect(strCodec({ default: "x" }).default).toBe("x");
    expect(strCodec().default).toBeUndefined();
  });

  it("round-trips a plain value through serialize → parse", () => {
    const c = strCodec();
    expect(c.parse(c.serialize("hello"))).toBe("hello");
  });
});
