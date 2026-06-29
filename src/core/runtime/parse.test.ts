import { describe, expect, it } from "vitest";

import { enumCodec, strCodec } from "../../codecs/index.js";
import type { Ctx } from "./context.js";
import { parse } from "./parse.js";

const config = {
  panel: enumCodec(["overview", "version", "bugs"]),
  version: { id: strCodec() },
};

const ctx: Ctx<typeof config> = {
  config,
  effects: [],
  actions: {},
};

const parseAt = (search: string) =>
  parse(ctx, new URL(`https://x.test/${search}`));

describe("parse", () => {
  it("reads a root codec and a section's codecs by raw dotted key", () => {
    expect(parseAt("?panel=bugs&version.id=1.2.3")).toEqual({
      panel: "bugs",
      version: { id: "1.2.3" },
    });
  });

  it("yields codec defaults / undefined for absent keys", () => {
    expect(parseAt("")).toEqual({
      panel: undefined,
      version: { id: undefined },
    });
  });

  it("hands each codec the decoded value (URLSearchParams owns the wire format)", () => {
    expect(parseAt("?version.id=a+b%2Fc").version.id).toBe("a b/c");
  });

  it("coerces an out-of-set enum value to its default (here: undefined)", () => {
    expect(parseAt("?panel=nope").panel).toBeUndefined();
  });

  it("ignores keys the config does not own", () => {
    expect(parseAt("?utm=x&panel=version")).toEqual({
      panel: "version",
      version: { id: undefined },
    });
  });
});
