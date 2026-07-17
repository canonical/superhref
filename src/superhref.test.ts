/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, strCodec, superhref } from "./index.js";

const QueryParamsSchema = superhref({
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
    expect(
      QueryParamsSchema.parse(at("?panel=bugs&bugs.severity=high")),
    ).toEqual({
      panel: "bugs",
      version: { id: null },
      bugs: { severity: "high", status: null },
    });
  });

  it("coerces hostile values instead of throwing", () => {
    const state = QueryParamsSchema.parse(
      at("?panel=nonsense&bugs.severity=BOGUS"),
    );
    expect(state.panel).toBeNull();
    expect(state.bugs.severity).toBeNull();
  });
});

describe("patch", () => {
  it("writes a root key and a section key", () => {
    const url = QueryParamsSchema.patch(at(), {
      panel: "bugs",
      bugs: { severity: "high" },
    });
    expect(url.search).toBe("?panel=bugs&bugs.severity=high");
  });

  it("encodes string values for the URL (via URLSearchParams: space becomes +)", () => {
    const url = QueryParamsSchema.patch(at(), { version: { id: "a b/c&d" } });
    expect(url.search).toBe("?version.id=a+b%2Fc%26d");
    expect(QueryParamsSchema.parse(url).version.id).toBe("a b/c&d");
  });

  it("ignores unknown patch keys at runtime (types reject them at compile time)", () => {
    // @ts-expect-error `typo` is not in the schema (a compile time guard).
    expect(QueryParamsSchema.patch(at("?panel=bugs"), { typo: 1 }).search).toBe(
      "?panel=bugs",
    );
    expect(
      // @ts-expect-error `nope` is not a codec of `bugs` (a compile time guard).
      QueryParamsSchema.patch(at("?panel=bugs"), { bugs: { nope: 1 } }).search,
    ).toBe("?panel=bugs");
  });
});

describe("clear", () => {
  it("removes only owned keys", () => {
    const url = QueryParamsSchema.clear(
      at("?panel=bugs&bugs.severity=high&utm=keepme"),
    );
    expect(url.search).toBe("?utm=keepme");
  });
});

describe("superhref guards the schema", () => {
  it("rejects a reserved schema key at construction", () => {
    // @ts-expect-error `patch` is a reserved key (a compile time guard).
    expect(() => superhref({ patch: strCodec() })).toThrow(
      'superhref: schema key "patch" is reserved (patch/clear/set)',
    );
  });
});
