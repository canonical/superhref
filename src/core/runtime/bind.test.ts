import { describe, expect, it } from "vitest";

import { enumCodec, numCodec, strCodec } from "../../codecs/index.js";
import { discriminatorEffect } from "../../effects/index.js";
import { withActions } from "../../patterns/index.js";
import type { ActionMap } from "../types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "../types/config.js";
import type { SuperhrefEffect } from "../types/effect.js";
import type { Empty } from "../types/util.js";
import { bind } from "./bind.js";
import type { Ctx } from "./context.js";

// Build a typed `Ctx` inline, with `C` inferred from the config and `A` from the actions,
// so `bind(ctx)` returns the real precisely-typed bound object for the tests to assert against
// that, not a hand-written shape.
const makeCtx = <
  C extends SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
>(
  config: C,
  opts: {
    effects?: SuperhrefEffect[];
    actions?: A &
      ActionMap<SuperhrefPatch<NoInfer<C>>, SuperhrefParsed<NoInfer<C>>>;
  } = {},
): Ctx<C, A> => ({
  config,
  effects: opts.effects ?? [],
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
        // state-aware section action with an extra arg
        bump: (patch, state, by: number) =>
          patch({ page: (state.page ?? 1) + by }),
        reset: (patch) => patch({ severity: null, page: null }),
      },
    ),
  },
  {
    effects: [discriminatorEffect("panel", PANELS)],
    actions: {
      openVersion: (patch, _state, id: string) =>
        patch({ panel: "version", version: { id } }),
      closePanel: (patch) => patch({ panel: null }),
    },
  },
);

const bindAt = (search = "") => bind(ctx, new URL(`https://x.test/${search}`));

describe("bind — hoisted values", () => {
  it("hoists root and section values under their raw keys", () => {
    const queryParams = bindAt("?panel=bugs&bugs.severity=high&bugs.page=3");
    expect(queryParams.panel).toBe("bugs");
    expect(queryParams.bugs.severity).toBe("high");
    expect(queryParams.bugs.page).toBe(3);
  });

  it("absent values read as undefined; section codec defaults apply", () => {
    const queryParams = bindAt("");
    expect(queryParams.panel).toBeUndefined();
    expect(queryParams.version.id).toBeUndefined();
    expect(queryParams.bugs.severity).toBeUndefined();
    expect(queryParams.bugs.page).toBe(1); // numCodec default
  });
});

describe("bind — root methods", () => {
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

describe("bind — section methods", () => {
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

describe("bind — section actions", () => {
  it("dispatches with the section's bind-time state and extra args", () => {
    // bump reads state.page (3) and adds the arg → 5
    expect(bindAt("?bugs.page=3").bugs.bump(2)).toBe("?bugs.page=5");
  });

  it("sees the section codec default in its bind-time state", () => {
    // no page in the URL → state.page is the codec default (1) → 1 + 1 = 2
    expect(bindAt("").bugs.bump(1)).toBe("?bugs.page=2");
  });

  it("scopes its patch to the section", () => {
    expect(bindAt("?bugs.severity=high&bugs.page=3").bugs.reset()).toBe("");
  });
});

describe("bind — cross-section actions", () => {
  it("dispatches with a root patch and writes across sections", () => {
    expect(bindAt("").openVersion("1.2.3")).toBe(
      "?panel=version&version.id=1.2.3",
    );
  });

  it("composes with effects — switching panel clears the sibling section", () => {
    // openVersion sets panel=version; the discriminator then clears bugs.*
    expect(bindAt("?panel=bugs&bugs.severity=high").openVersion("1.2.3")).toBe(
      "?panel=version&version.id=1.2.3",
    );
  });

  it("closePanel removes the panel; the discriminator clears its orphaned section", () => {
    expect(bindAt("?panel=version&version.id=1.2.3&utm=x").closePanel()).toBe(
      "?utm=x",
    );
  });
});

describe("bind — effects run during a bound op", () => {
  it("a root .set fires the discriminator", () => {
    expect(
      bindAt("?panel=bugs&bugs.severity=high&version.id=1").set(
        "panel",
        "version",
      ),
    ).toBe("?panel=version&version.id=1");
  });
});

describe("bind — closures over the bind-time url & state", () => {
  it("each derived href is independent (no accumulation across calls)", () => {
    const queryParams = bindAt("?panel=overview");
    expect(queryParams.set("panel", "version")).toBe("?panel=version");
    // does NOT see the previous set — still derives from "?panel=overview"
    expect(queryParams.bugs.set("severity", "high")).toBe(
      "?panel=overview&bugs.severity=high",
    );
  });

  it("repeated action calls are stateless (each from the same bind-time state)", () => {
    const queryParams = bindAt("?bugs.page=3");
    expect(queryParams.bugs.bump(2)).toBe("?bugs.page=5");
    expect(queryParams.bugs.bump(2)).toBe("?bugs.page=5"); // not 7
  });

  it("does not mutate the bound URL", () => {
    const url = new URL("https://x.test/?panel=bugs");
    const queryParams = bind(ctx, url);
    queryParams.set("panel", "version");
    queryParams.clear();
    expect(url.search).toBe("?panel=bugs");
  });
});
