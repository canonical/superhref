/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, strCodec } from "../codecs/index.js";
import { bind } from "../core/runtime/bind.js";
import type { Ctx } from "../core/runtime/context.js";
import type { ActionMap } from "../core/types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "../core/types/config.js";
import type { SuperhrefEffect } from "../core/types/effect.js";
import type { Empty } from "../core/types/util.js";
import { discriminatorEffect } from "./index.js";

const PANELS = ["overview", "version", "bugs"] as const;

describe("discriminatorEffect — unit", () => {
  const eff = discriminatorEffect("panel", PANELS);

  it("clears every controlled prefix except the one matching the new value", () => {
    const params = new URLSearchParams(
      "panel=version&version.id=1&bugs.severity=high&overview.x=1",
    );
    eff(params, ["panel"]);
    expect(params.toString()).toBe("panel=version&version.id=1");
  });

  it("no-ops when its trigger key isn't in the touched set", () => {
    const params = new URLSearchParams("panel=version&bugs.severity=high");
    eff(params, ["bugs"]);
    expect(params.toString()).toBe("panel=version&bugs.severity=high");
  });

  it("declares the key it requires", () => {
    expect(eff.requires).toEqual(["panel"]);
  });
});

// A typed `Ctx` built inline, so `bind(ctx)` returns the real bound object the
// integration cases assert against.
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

const ctx = makeCtx(
  {
    panel: enumCodec(PANELS),
    version: { id: strCodec() },
    bugs: { severity: enumCodec(["low", "high"]) },
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

describe("discriminatorEffect — through bind", () => {
  it("a cross-section action that switches panel clears the sibling section", () => {
    // openVersion sets panel=version; the discriminator then clears bugs.*
    expect(bindAt("?panel=bugs&bugs.severity=high").openVersion("1.2.3")).toBe(
      "?panel=version&version.id=1.2.3",
    );
  });

  it("removing the panel clears its orphaned section, keeping foreign keys", () => {
    expect(bindAt("?panel=version&version.id=1.2.3&utm=x").closePanel()).toBe(
      "?utm=x",
    );
  });

  it("a root .set fires the discriminator", () => {
    expect(
      bindAt("?panel=bugs&bugs.severity=high&version.id=1").set(
        "panel",
        "version",
      ),
    ).toBe("?panel=version&version.id=1");
  });
});
