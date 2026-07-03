/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { enumCodec, strCodec, superhref, withActions } from "../src/index.js";

const SEVERITY = ["low", "medium", "high", "critical"] as const;

const app = superhref(
  {
    panel: enumCodec(["overview", "version", "bugs"]),
    version: { id: strCodec() },
    bugs: withActions(
      { severity: enumCodec(SEVERITY) },
      {
        // state-aware section action: flips severity high ↔ low
        cycleSeverity: (patch, s) =>
          patch({ severity: s.severity === "high" ? "low" : "high" }),
      },
    ),
    // a section with actions, built with withActions
    versions: withActions(
      { id: strCodec() },
      { clearId: (patch) => patch({ id: null }) },
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

const at = (search = ""): URL => new URL(`https://example.test/app${search}`);

describe("bind values", () => {
  it("hoists root values and section values under raw keys", () => {
    const queryParams = app.bind(at("?panel=bugs&bugs.severity=high"));
    expect(queryParams.panel).toBe("bugs");
    expect(queryParams.bugs.severity).toBe("high");
    expect(queryParams.version.id).toBeUndefined();
  });
});

describe("bind .set", () => {
  it("root .set writes one root key", () => {
    const queryParams = app.bind(at());
    expect(queryParams.set("panel", "version")).toBe("?panel=version");
  });

  it("section .set writes one section key", () => {
    const queryParams = app.bind(at());
    expect(queryParams.bugs.set("severity", "critical")).toBe(
      "?bugs.severity=critical",
    );
  });

  it("section .patch writes a value and accepts null to delete", () => {
    const queryParams = app.bind(at("?panel=bugs&bugs.severity=high"));
    expect(queryParams.bugs.patch({ severity: "low" })).toBe(
      "?panel=bugs&bugs.severity=low",
    );
    // `null` must be accepted here; a section patch deletes with null.
    expect(queryParams.bugs.patch({ severity: null })).toBe("?panel=bugs");
  });

  it("each bound href is independent (closed over the bind-time url)", () => {
    const queryParams = app.bind(at("?panel=overview"));
    expect(queryParams.set("panel", "version")).toBe("?panel=version");
    expect(queryParams.bugs.set("severity", "low")).toBe(
      "?panel=overview&bugs.severity=low",
    );
  });
});

describe("bind section actions", () => {
  it("a state-aware section action reads the bound state", () => {
    // with no severity yet the value is not "high", so the toggle sets "high"
    expect(app.bind(at("?panel=bugs")).bugs.cycleSeverity()).toBe(
      "?panel=bugs&bugs.severity=high",
    );
    // severity is high, so the toggle flips it to low
    expect(
      app.bind(at("?panel=bugs&bugs.severity=high")).bugs.cycleSeverity(),
    ).toBe("?panel=bugs&bugs.severity=low");
  });

  it("works on a section built with withActions", () => {
    expect(app.bind(at("?versions.id=abc")).versions.clearId()).toBe("");
  });
});

describe("bind actions that span sections", () => {
  it("openVersion sets the panel and the version id in one href", () => {
    expect(app.bind(at()).openVersion("1.2.3")).toBe(
      "?panel=version&version.id=1.2.3",
    );
  });

  it("closePanel clears the panel", () => {
    const href = app.bind(at("?panel=version&version.id=1.2.3")).closePanel();
    expect(href).toContain("version.id=1.2.3");
    expect(href).not.toContain("panel=");
  });
});
