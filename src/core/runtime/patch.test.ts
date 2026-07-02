/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, numCodec, strCodec } from "../../codecs/index.js";
import type { Ctx } from "./context.js";
import { patch } from "./patch.js";

const PANELS = ["overview", "version", "bugs"] as const;
const config = {
  panel: enumCodec(PANELS),
  version: { id: strCodec() },
  bugs: {
    severity: enumCodec(["low", "high"]),
    page: numCodec({ default: 1, integer: true, min: 1 }),
  },
};
const ctx: Ctx<typeof config> = {
  config,
  actions: {},
};

const patchAt = (search: string, partial: Record<string, unknown>): string =>
  patch(ctx, new URL(`https://x.test/${search}`), partial).search;

describe("patch", () => {
  describe("writing", () => {
    it("writes a root key and a section's dotted key", () => {
      expect(patchAt("", { panel: "bugs", bugs: { severity: "high" } })).toBe(
        "?panel=bugs&bugs.severity=high",
      );
    });

    it("touches only the named keys, merging into existing state", () => {
      expect(
        patchAt("?panel=bugs&bugs.severity=high", {
          bugs: { severity: "low" },
        }),
      ).toBe("?panel=bugs&bugs.severity=low");
    });

    it("writes a value verbatim, even when it equals the codec's default", () => {
      // values are written verbatim — page=1 stays even though it equals the default (use null to remove)
      expect(patchAt("?bugs.page=3", { bugs: { page: 1 } })).toBe(
        "?bugs.page=1",
      );
    });
  });

  describe("null deletes", () => {
    it("a null leaf deletes just that key", () => {
      expect(
        patchAt("?panel=bugs&bugs.severity=high&bugs.page=2", {
          bugs: { severity: null },
        }),
      ).toBe("?panel=bugs&bugs.page=2");
    });

    it("a null section clears every key under its prefix", () => {
      expect(
        patchAt("?panel=bugs&bugs.severity=high&bugs.page=2", { bugs: null }),
      ).toBe("?panel=bugs");
    });
  });

  describe("undefined = no change", () => {
    it("an undefined leaf leaves that key untouched (null still deletes)", () => {
      expect(patchAt("?bugs.page=5", { bugs: { page: undefined } })).toBe(
        "?bugs.page=5",
      );
      expect(patchAt("?bugs.page=5", { bugs: { page: null } })).toBe("");
    });

    it("an undefined section leaves the whole section untouched", () => {
      expect(
        patchAt("?bugs.severity=high&bugs.page=9", { bugs: undefined }),
      ).toBe("?bugs.severity=high&bugs.page=9");
    });
  });

  describe("unknown keys are ignored", () => {
    it("ignores an unknown root key", () => {
      expect(patchAt("?panel=bugs", { typo: 1 })).toBe("?panel=bugs");
    });

    it("ignores an unknown section codec", () => {
      expect(patchAt("?panel=bugs", { bugs: { nope: 1 } })).toBe("?panel=bugs");
    });
  });

  describe("foreign keys", () => {
    it("leaves keys the config doesn't own untouched, preserving order", () => {
      expect(patchAt("?utm=x&panel=overview&ref=y", { panel: "bugs" })).toBe(
        "?utm=x&panel=bugs&ref=y",
      );
    });
  });

  describe("immutability & composition", () => {
    it("returns a new URL, leaving the input untouched", () => {
      const url = new URL("https://x.test/?panel=bugs");
      const out = patch(ctx, url, { panel: "version" });
      expect(out).not.toBe(url);
      expect(url.search).toBe("?panel=bugs"); // original unchanged
      expect(out.search).toBe("?panel=version");
    });

    it("applies many changes in one call", () => {
      expect(patchAt("", { panel: "version", version: { id: "1.2.3" } })).toBe(
        "?panel=version&version.id=1.2.3",
      );
    });
  });
});
