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

    it("absence (null) yields the default, or null when there is none", () => {
      expect(strCodec().parse(null)).toBeNull();
      expect(strCodec({ default: "x" }).parse(null)).toBe("x");
    });

    it("an explicit empty value parses to '' rather than the default", () => {
      expect(strCodec().parse("")).toBe("");
      expect(strCodec({ default: "x" }).parse("")).toBe("");
    });
  });

  describe("serialize", () => {
    it("returns a populated string unchanged", () => {
      expect(strCodec().serialize("hello")).toBe("hello");
      expect(strCodec().serialize("a b/c&d")).toBe("a b/c&d");
    });

    it("null (the absent value) serializes to null (omit the key)", () => {
      expect(strCodec().serialize(null)).toBeNull();
    });

    it("intentionally serializes the empty string verbatim, with no special treatment", () => {
      expect(strCodec().serialize("")).toBe("");
      expect(strCodec({ default: "x" }).serialize("")).toBe("");
      expect(strCodec({ default: "" }).serialize("")).toBe("");
    });

    it("keeps the empty string through serialize then parse instead of reviving the default", () => {
      const c = strCodec({ default: "x" });
      expect(c.parse(c.serialize(""))).toBe("");
    });
  });

  it("exposes its default for fallback on read", () => {
    expect(strCodec({ default: "x" }).default).toBe("x");
    expect(strCodec().default).toBeUndefined();
  });

  it("a plain value survives serialize then parse", () => {
    const c = strCodec();
    expect(c.parse(c.serialize("hello"))).toBe("hello");
  });
});
