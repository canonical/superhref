/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";
import * as z from "zod";

import { zodCodec } from "../../codecs/index.js";
import { withActions } from "../../patterns/index.js";
import type { Ctx } from "../types/context.js";
import { KEY_SEP } from "./keys.js";
import { assertValidSchema } from "./schema-guard.js";

const PageSchema = z.codec(z.string(), z.number(), {
  decode: (value) => Number(value),
  encode: (value) => String(value),
});
const stringCodec = zodCodec(z.string());
const ctxOf = (schema: unknown, actions: unknown = {}) =>
  ({ schema, actions }) as Ctx;

describe("assertValidSchema accepts valid schemas", () => {
  it("accepts direct Zod schemas, codecs, sections, and root actions", () => {
    const ctx = ctxOf(
      {
        panel: z.enum(["overview", "bugs"]),
        version: { id: z.string() },
        bugs: withActions(
          { page: PageSchema },
          { jump: (patch, _state, page: number) => patch({ page }) },
        ),
      },
      { reset: () => "" },
    );
    expect(() => assertValidSchema(ctx)).not.toThrow();
  });

  it("accepts an empty schema", () => {
    expect(() => assertValidSchema(ctxOf({}))).not.toThrow();
  });

  it("accepts the full documented key charset", () => {
    expect(() =>
      assertValidSchema(ctxOf({ "Sort_by-2~x": stringCodec })),
    ).not.toThrow();
  });
});

describe("assertValidSchema rejects root schema keys", () => {
  it("rejects the reserved method names", () => {
    for (const key of ["patch", "clear", "set"])
      expect(() => assertValidSchema(ctxOf({ [key]: stringCodec }))).toThrow(
        `superhref: schema key "${key}" is reserved (patch/clear/set)`,
      );
  });

  it("rejects a key containing the separator", () => {
    const key = `a${KEY_SEP}b`;
    expect(() => assertValidSchema(ctxOf({ [key]: stringCodec }))).toThrow(
      `superhref: schema key "${key}" is not a valid URL key`,
    );
  });

  it("rejects invalid URL key syntax", () => {
    for (const key of ["9lives", "_page", "a b"])
      expect(() => assertValidSchema(ctxOf({ [key]: stringCodec }))).toThrow(
        `superhref: schema key "${key}" is not a valid URL key`,
      );
  });

  it("rejects a value that is neither a codec nor a section", () => {
    expect(() => assertValidSchema(ctxOf({ panel: 42 }))).toThrow(
      'superhref: schema value "panel" is neither a codec nor a section',
    );
    expect(() => assertValidSchema(ctxOf({ panel: null }))).toThrow(
      'superhref: schema value "panel" is neither a codec nor a section',
    );
  });
});

describe("assertValidSchema rejects root actions", () => {
  it("rejects the reserved method names", () => {
    expect(() => assertValidSchema(ctxOf({}, { clear: () => "" }))).toThrow(
      'superhref: action "clear" is reserved (patch/clear/set)',
    );
  });

  it("rejects a name that collides with a schema key", () => {
    expect(() =>
      assertValidSchema(ctxOf({ panel: stringCodec }, { panel: () => "" })),
    ).toThrow('superhref: action "panel" collides with the schema key "panel"');
  });

  it("rejects a value that is not a function", () => {
    expect(() => assertValidSchema(ctxOf({}, { go: 42 }))).toThrow(
      'superhref: action "go" is not a function',
    );
  });
});

describe("assertValidSchema rejects section codec keys", () => {
  it("rejects the reserved names", () => {
    expect(() =>
      assertValidSchema(ctxOf({ bugs: { set: stringCodec } })),
    ).toThrow(
      'superhref: section "bugs" has a reserved codec key "set" (patch/set/codecs/actions)',
    );
    expect(() =>
      assertValidSchema(ctxOf({ bugs: { actions: { go: () => "" } } })),
    ).toThrow(
      'superhref: section "bugs" has a reserved codec key "actions" (patch/set/codecs/actions)',
    );
  });

  it("rejects a key containing the separator", () => {
    const key = `a${KEY_SEP}b`;
    expect(() =>
      assertValidSchema(ctxOf({ bugs: { [key]: stringCodec } })),
    ).toThrow(`superhref: section "bugs" has an invalid codec key "${key}"`);
  });

  it("rejects a value that is not a codec", () => {
    expect(() => assertValidSchema(ctxOf({ bugs: { id: 42 } }))).toThrow(
      'superhref: section "bugs" has a codec key "id" whose value is not a codec',
    );
  });
});

describe("assertValidSchema rejects malformed section pairs", () => {
  it("rejects an action with a reserved name", () => {
    expect(() =>
      assertValidSchema(
        ctxOf({
          bugs: { codecs: { page: stringCodec }, actions: { patch: () => "" } },
        }),
      ),
    ).toThrow(
      'superhref: section "bugs" has an action named "patch" (patch/set are reserved)',
    );
  });

  it("rejects an action that collides with a codec key", () => {
    expect(() =>
      assertValidSchema(
        ctxOf({
          bugs: { codecs: { page: stringCodec }, actions: { page: () => "" } },
        }),
      ),
    ).toThrow(
      'superhref: section "bugs" has a codec key and an action named "page"',
    );
  });

  it("rejects an action that is not a function", () => {
    expect(() =>
      assertValidSchema(
        ctxOf({ bugs: { codecs: { page: stringCodec }, actions: { go: 1 } } }),
      ),
    ).toThrow(
      'superhref: section "bugs" has an action "go" that is not a function',
    );
  });

  it("rejects a key that is neither codecs nor actions", () => {
    expect(() =>
      assertValidSchema(
        ctxOf({
          bugs: { codecs: { page: stringCodec }, action: { go: () => "" } },
        }),
      ),
    ).toThrow('superhref: section "bugs" has an unknown key "action"');
  });

  it("rejects a codecs value that is not a codecs map", () => {
    expect(() =>
      assertValidSchema(ctxOf({ bugs: { codecs: 42, actions: {} } })),
    ).toThrow(
      'superhref: section "bugs" has a "codecs" value that is not a codecs map',
    );
  });
});

describe("assertValidSchema reports every problem at once", () => {
  it("lists each problem in one TypeError", () => {
    const ctx = ctxOf({ set: stringCodec }, { clear: () => "" });
    expect(() => assertValidSchema(ctx)).toThrow(TypeError);
    expect(() => assertValidSchema(ctx)).toThrow(
      'superhref: schema key "set" is reserved',
    );
    expect(() => assertValidSchema(ctx)).toThrow(
      'superhref: action "clear" is reserved',
    );
  });
});
