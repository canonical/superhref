/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec } from "./enum.js";

describe("enumCodec", () => {
  const STATUS = ["low", "high"];

  describe("parse", () => {
    it("passes a valid member through", () => {
      expect(enumCodec(STATUS).parse("high")).toBe("high");
    });

    it("coerces a non-member to the default (or undefined)", () => {
      expect(enumCodec(STATUS).parse("nope")).toBeUndefined();
      expect(enumCodec(STATUS, { default: "low" }).parse("nope")).toBe("low");
    });

    it("absence (null) yields the default (or undefined)", () => {
      expect(enumCodec(STATUS).parse(null)).toBeUndefined();
      expect(enumCodec(STATUS, { default: "low" }).parse(null)).toBe("low");
    });

    it("membership is exact and case-sensitive", () => {
      expect(enumCodec(STATUS).parse("HIGH")).toBeUndefined(); // wrong case
      expect(enumCodec(STATUS).parse("hig")).toBeUndefined(); // substring, not a member
      expect(enumCodec(STATUS).parse("")).toBeUndefined(); // empty, not a member
    });

    it("matches a member containing spaces (URL layer should have already decoded it)", () => {
      const c = enumCodec(["in progress", "done"]);
      expect(c.parse("in progress")).toBe("in progress");
    });
  });

  describe("serialize", () => {
    it("writes the member verbatim (the URL layer encodes afterwards)", () => {
      expect(enumCodec(STATUS).serialize("high")).toBe("high");
      expect(enumCodec(["in progress", "done"]).serialize("in progress")).toBe(
        "in progress",
      );
    });

    it("undefined serializes to null (omit the key)", () => {
      expect(enumCodec(STATUS).serialize(undefined)).toBeNull();
    });
  });

  it("exposes its default for read-side fallback", () => {
    expect(enumCodec(STATUS, { default: "low" }).default).toBe("low");
    expect(enumCodec(STATUS).default).toBeUndefined();
  });

  it("round-trips a member through serialize → parse", () => {
    const c = enumCodec(STATUS, { default: "low" });
    expect(c.parse(c.serialize("high"))).toBe("high");
  });
});
