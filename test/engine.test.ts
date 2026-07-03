/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, strCodec, superhref } from "../src/index.js";

const app = superhref({
  panel: enumCodec(["overview", "version", "bugs"]),
  version: { id: strCodec() },
  bugs: {
    severity: enumCodec(["low", "medium", "high", "critical"]),
    status: enumCodec(["open", "closed"]),
  },
});

const at = (search = ""): URL => new URL(`https://example.test/app${search}`);

describe("parse", () => {
  it("reads nested state, raw keys, with defaults", () => {
    expect(app.parse(at("?panel=bugs&bugs.severity=high"))).toEqual({
      panel: "bugs",
      version: { id: undefined },
      bugs: { severity: "high", status: undefined },
    });
  });

  it("coerces hostile values instead of throwing", () => {
    const state = app.parse(at("?panel=nonsense&bugs.severity=BOGUS"));
    expect(state.panel).toBeUndefined();
    expect(state.bugs.severity).toBeUndefined();
  });
});

describe("patch", () => {
  it("writes a root key and a section key", () => {
    const url = app.patch(at(), { panel: "bugs", bugs: { severity: "high" } });
    expect(url.search).toBe("?panel=bugs&bugs.severity=high");
  });

  it("encodes string values for the URL (via URLSearchParams: space becomes +)", () => {
    const url = app.patch(at(), { version: { id: "a b/c&d" } });
    expect(url.search).toBe("?version.id=a+b%2Fc%26d");
    expect(app.parse(url).version.id).toBe("a b/c&d");
  });

  it("a leaf null deletes; a section set to null clears its prefix", () => {
    const start = at("?panel=bugs&bugs.severity=high&bugs.status=open");
    expect(app.patch(start, { bugs: { severity: null } }).search).toBe(
      "?panel=bugs&bugs.status=open",
    );
    expect(app.patch(start, { bugs: null }).search).toBe("?panel=bugs");
  });

  it("leaves foreign keys untouched, preserving order", () => {
    const url = app.patch(at("?utm_source=news&panel=overview"), {
      panel: "bugs",
    });
    expect(url.search).toBe("?utm_source=news&panel=bugs");
  });

  it("ignores unknown patch keys at runtime (types reject them at compile time)", () => {
    // @ts-expect-error `typo` is not in the config (a compile time guard).
    expect(app.patch(at("?panel=bugs"), { typo: 1 }).search).toBe(
      "?panel=bugs",
    );
    // @ts-expect-error `nope` is not a codec of `bugs` (a compile time guard).
    expect(app.patch(at("?panel=bugs"), { bugs: { nope: 1 } }).search).toBe(
      "?panel=bugs",
    );
  });
});

describe("clear", () => {
  it("removes only owned keys", () => {
    const url = app.clear(at("?panel=bugs&bugs.severity=high&utm=keepme"));
    expect(url.search).toBe("?utm=keepme");
  });
});
