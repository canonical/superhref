/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, numCodec, strCodec } from "../../codecs/index.js";
import { withActions } from "../../patterns/index.js";
import type { ActionMap } from "../types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "../types/config.js";
import type { Ctx } from "../types/context.js";
import type { Empty } from "../types/util.js";
import { bind } from "./bind.js";

const makeCtx = <
  C extends SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
>(
  config: C,
  opts: {
    actions?: A &
      ActionMap<SuperhrefPatch<NoInfer<C>>, SuperhrefParsed<NoInfer<C>>>;
  } = {},
): Ctx<C, A> => ({
  config,
  actions: (opts.actions ?? {}) as A,
});

const PANELS = ["overview", "version", "bugs"] as const;
const SEVERITY = ["low", "high"] as const;

const ctx = makeCtx(
  {
    panel: enumCodec(PANELS),
    version: { id: strCodec() },
    bugs: withActions(
      { severity: enumCodec(SEVERITY), page: numCodec({ default: 1 }) },
      {
        bump: (patch, state, by: number) =>
          patch({ page: (state.page ?? 1) + by }),
        reset: (patch) => patch({ severity: null, page: null }),
      },
    ),
  },
  {
    actions: {
      openVersion: (patch, _state, id: string) =>
        patch({ panel: "version", version: { id } }),
      closePanel: (patch) => patch({ panel: null }),
    },
  },
);

const bindAt = (search = "") => bind(ctx, new URL(`https://x.test/${search}`));

describe("bind hoisted values", () => {
  it("hoists root and section values under their raw keys", () => {
    const queryParams = bindAt("?panel=bugs&bugs.severity=high&bugs.page=3");
    expect(queryParams.panel).toBe("bugs");
    expect(queryParams.bugs.severity).toBe("high");
    expect(queryParams.bugs.page).toBe(3);
  });

  it("absent values read as null; section codec defaults apply", () => {
    const queryParams = bindAt("");
    expect(queryParams.panel).toBeNull();
    expect(queryParams.version.id).toBeNull();
    expect(queryParams.bugs.severity).toBeNull();
    expect(queryParams.bugs.page).toBe(1);
  });
});

describe("bind root methods", () => {
  it("set writes one root key", () => {
    expect(bindAt("").set("panel", "version")).toBe("?panel=version");
  });

  it("set null deletes the key", () => {
    expect(bindAt("?panel=overview").set("panel", null)).toBe("");
  });

  it("patch applies many keys at once", () => {
    expect(
      bindAt("").patch({ panel: "bugs", bugs: { severity: "high" } }),
    ).toBe("?panel=bugs&bugs.severity=high");
  });

  it("clear removes owned keys, keeping foreign ones", () => {
    expect(bindAt("?panel=bugs&bugs.severity=high&utm=x").clear()).toBe(
      "?utm=x",
    );
  });
});

describe("bind section methods", () => {
  it("set writes one section key (dotted)", () => {
    expect(bindAt("").bugs.set("severity", "high")).toBe("?bugs.severity=high");
  });

  it("set null deletes one section key", () => {
    expect(
      bindAt("?bugs.severity=high&bugs.page=3").bugs.set("severity", null),
    ).toBe("?bugs.page=3");
  });

  it("patch applies many section keys at once", () => {
    expect(bindAt("").bugs.patch({ severity: "high", page: 2 })).toBe(
      "?bugs.severity=high&bugs.page=2",
    );
  });
});

describe("bind section actions", () => {
  it("dispatches with the section state seen at bind time and extra args", () => {

    expect(bindAt("?bugs.page=3").bugs.bump(2)).toBe("?bugs.page=5");
  });

  it("sees the section codec default in the state seen at bind time", () => {
    expect(bindAt("").bugs.bump(1)).toBe("?bugs.page=2");
  });

  it("scopes its patch to the section", () => {
    expect(bindAt("?bugs.severity=high&bugs.page=3").bugs.reset()).toBe("");
  });
});

describe("bind actions that span sections", () => {
  it("dispatches with a root patch and writes across sections", () => {
    expect(bindAt("").openVersion("1.2.3")).toBe(
      "?panel=version&version.id=1.2.3",
    );
  });
});

describe("bind closures over the url and state seen at bind time", () => {
  it("each derived href is independent (no accumulation across calls)", () => {
    const queryParams = bindAt("?panel=overview");
    expect(queryParams.set("panel", "version")).toBe("?panel=version");
    expect(queryParams.bugs.set("severity", "high")).toBe(
      "?panel=overview&bugs.severity=high",
    );
  });

  it("repeated action calls are stateless (each uses the state seen at bind time)", () => {
    const queryParams = bindAt("?bugs.page=3");
    expect(queryParams.bugs.bump(2)).toBe("?bugs.page=5");
    expect(queryParams.bugs.bump(2)).toBe("?bugs.page=5");
  });

  it("does not mutate the bound URL", () => {
    const url = new URL("https://x.test/?panel=bugs");
    const queryParams = bind(ctx, url);
    queryParams.set("panel", "version");
    queryParams.clear();
    expect(url.search).toBe("?panel=bugs");
  });
});
