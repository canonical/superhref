import { describe, expect, it } from "vitest";

import { numCodec } from "./number.js";

describe("numCodec", () => {
  describe("parse", () => {
    it("parses a numeric string (int, float, negative)", () => {
      expect(numCodec().parse("3")).toBe(3);
      expect(numCodec().parse("2.5")).toBe(2.5);
      expect(numCodec().parse("-5")).toBe(-5);
    });

    it("keeps 0 — it is a real value, not 'missing'", () => {
      expect(numCodec().parse("0")).toBe(0);
    });

    it("treats both absence AND empty string as missing → default", () => {
      // `Number("")` is 0 — a classic hand-edited-URL trap — so "" must mean missing.
      expect(numCodec({ default: 1 }).parse(null)).toBe(1);
      expect(numCodec({ default: 1 }).parse("")).toBe(1);
      expect(numCodec().parse("")).toBeUndefined();
    });

    it("falls back to default on non-numeric / non-finite input", () => {
      expect(numCodec({ default: 1 }).parse("abc")).toBe(1);
      expect(numCodec({ default: 1 }).parse("Infinity")).toBe(1);
      expect(numCodec({ default: 1 }).parse("1e999")).toBe(1); // overflows to Infinity
    });

    it("with `integer`, coerces non-integers to the default", () => {
      const c = numCodec({ default: 1, integer: true });
      expect(c.parse("3")).toBe(3);
      expect(c.parse("2.5")).toBe(1);
    });

    it("clamps out-of-range input to min / max", () => {
      const c = numCodec({ min: 1, max: 10 });
      expect(c.parse("-4")).toBe(1);
      expect(c.parse("99")).toBe(10);
      expect(c.parse("5")).toBe(5);
    });

    it("checks `integer` before clamping", () => {
      // 2.5 is rejected by `integer` first, so it never reaches the min clamp.
      expect(numCodec({ default: 9, integer: true, min: 1 }).parse("2.5")).toBe(
        9,
      );
    });
  });

  describe("serialize", () => {
    it("stringifies the number", () => {
      expect(numCodec().serialize(3)).toBe("3");
      expect(numCodec().serialize(2.5)).toBe("2.5");
      expect(numCodec().serialize(-5)).toBe("-5");
    });

    it("writes 0 (it is not 'missing')", () => {
      expect(numCodec().serialize(0)).toBe("0");
    });

    it("undefined serializes to null (omit the key)", () => {
      expect(numCodec().serialize(undefined)).toBeNull();
    });
  });

  it("exposes its default for read-side fallback", () => {
    expect(numCodec({ default: 1 }).default).toBe(1);
    expect(numCodec().default).toBeUndefined();
  });

  it("round-trips through serialize → parse, including 0", () => {
    const c = numCodec({ default: 1 });
    expect(c.parse(c.serialize(0))).toBe(0);
    expect(c.parse(c.serialize(42))).toBe(42);
  });
});
