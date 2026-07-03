/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, strCodec } from "../../codecs/index.js";
import { clear } from "./clear.js";
import type { Ctx } from "./context.js";

const config = {
  panel: enumCodec(["overview", "version", "bugs"]),
  version: { id: strCodec() },
};
const ctx: Ctx<typeof config> = {
  config,
  actions: {},
};

const clearAt = (search: string) =>
  clear(ctx, new URL(`https://x.test/${search}`)).search;

describe("clear", () => {
  it("removes every owned key", () => {
    expect(clearAt("?panel=bugs&version.id=1.2.3")).toBe("");
  });

  it("drops only owned keys, keeping foreign ones in order", () => {
    expect(clearAt("?utm=x&panel=bugs&version.id=1&ref=y")).toBe(
      "?utm=x&ref=y",
    );
  });

  it("leaves the URL unchanged when the config owns nothing in it", () => {
    expect(clearAt("?utm=x")).toBe("?utm=x");
  });

  it("returns a new URL, leaving the input untouched", () => {
    const url = new URL("https://x.test/?panel=bugs");
    const out = clear(ctx, url);
    expect(out).not.toBe(url);
    expect(url.search).toBe("?panel=bugs"); // original unchanged
    expect(out.search).toBe("");
  });
});
