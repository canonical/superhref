// This file is part of superhref, a typed, composable URL search-param state library.
//
// Copyright 2026 Canonical Ltd.
//
// SPDX-License-Identifier: LGPL-3.0-only
//
// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU Lesser General Public License version 3, as published by
// the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY
// QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
// License for more details.
//
// You should have received a copy of the GNU Lesser General Public License along
// with this program.  If not, see http://www.gnu.org/licenses/.

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
