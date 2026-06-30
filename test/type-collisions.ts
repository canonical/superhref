// Compile-time proof of the config/action/effect validators. Checked by `tsc` (it's in
// the tsconfig `include`) but NOT run by vitest (no `.test.ts` suffix). Each
// `@ts-expect-error` asserts a real error exists — if a check regresses, the suppression
// goes unused and `tsc` fails. The valid cases (no suppression) assert good configs —
// including `withActions` action params and the bound `set` overloads — still type-check.

import {
  discriminatorEffect,
  enumCodec,
  strCodec,
  superhref,
  withActions,
} from "../src/index.js";

const P = ["a", "b"] as const;

// ✓ valid config: a root codec, a bare-codecs (actionless) section, and a `withActions`
// section whose action params are inferred — `state.severity` is typed, no annotation.
superhref(
  {
    panel: enumCodec(P),
    versions: { id: strCodec() }, // actionless section — bare codecs map
    bugs: withActions(
      { severity: enumCodec(["low", "high"]) },
      {
        toggle: (patch, state) =>
          patch({ severity: state.severity === "high" ? "low" : "high" }),
      },
    ),
  },
  { actions: { openBug: () => "?x" } },
);

// ✗ a `withActions` action param IS typed — a wrong value is a compile error.
withActions(
  { severity: enumCodec(["low", "high"]) },
  {
    // @ts-expect-error — severity is "low" | "high" | null, not a number
    bad: (patch) => patch({ severity: 123 }),
  },
);

// ✗ reserved config key — would shadow the bound `.set`.
superhref({
  // @ts-expect-error — `set` is reserved
  set: enumCodec(P),
});

// ✗ invalid config-key syntax (contains ".").
superhref({
  // @ts-expect-error — "a.b" is not a valid URL key
  "a.b": enumCodec(P),
});

// ✗ action name collides with a config key.
superhref(
  { panel: enumCodec(P) },
  {
    actions: {
      // @ts-expect-error — action `panel` collides with the config key
      panel: () => "?x",
    },
  },
);

// ✗ action name collides with an instance method.
superhref(
  { foo: enumCodec(P) },
  {
    actions: {
      // @ts-expect-error — action `clear` collides with the instance method
      clear: () => "?x",
    },
  },
);

// ✗ section: reserved codec key (bare-codecs section).
superhref({
  // @ts-expect-error — codec key `set` is reserved in a section
  bugs: { set: strCodec() },
});

// ✗ withActions: an action colliding with a codec key — caught at the BUILDER, so even a
// hand-built section (used with `bind` directly, never `superhref`) is guarded.
withActions(
  { dup: strCodec() },
  {
    // @ts-expect-error — action `dup` collides with the codec key
    dup: () => "?x",
  },
);

// ✗ withActions: a reserved section action name (would shadow the handle's `.set`).
withActions(
  { severity: enumCodec(["low", "high"]) },
  {
    // @ts-expect-error — `set` is a reserved section action name
    set: () => "?x",
  },
);

// ✗ withActions: a reserved codec key — caught at the builder (no superhref needed).
withActions(
  // @ts-expect-error — codec key `set` is reserved
  { set: strCodec() },
  {},
);

// ✗ withActions: an invalid codec-key syntax — caught at the builder.
withActions(
  // @ts-expect-error — "a.b" is not a valid codec key
  { "a.b": strCodec() },
  {},
);

// ✗ section: invalid codec-key syntax (bare-codecs section).
superhref({
  // @ts-expect-error — "a.b" is not a valid codec key
  bugs: { "a.b": strCodec() },
});

// ✓ an effect requiring an owned key compiles.
superhref(
  { panel: enumCodec(P), bugs: { severity: enumCodec(P) } },
  { effects: [discriminatorEffect("panel", ["a", "b"])] },
);

// ✗ effect requires a key the config doesn't own.
superhref(
  { panel: enumCodec(P) },
  {
    effects: [
      // @ts-expect-error — discriminator key "panl" isn't an owned key
      discriminatorEffect("panl", []),
    ],
  },
);

// The bound `set` is one overload PER KEY — only a literal key with its matching value
// type-checks (this is what makes the hover read as overloads, not `<K>(key, value)`).
const qp = superhref({
  panel: enumCodec(P),
  bugs: { severity: enumCodec(["low", "high"]) },
}).bind(new URL("https://x.test/"));

qp.bugs.set("severity", "low"); // ✓ valid section key + value
qp.set("panel", "a"); //          ✓ valid root key + value

// @ts-expect-error — wrong value type for "severity"
qp.bugs.set("severity", 123);
// @ts-expect-error — "nope" is not a codec key of `bugs`
qp.bugs.set("nope", "low");
// @ts-expect-error — wrong value type for the root key "panel"
qp.set("panel", 5);
// @ts-expect-error — "bugs" is a section, not a root-settable key
qp.set("bugs", "x");

// ✗ a codec's serialize does not accept null — its value type is `value | undefined`.
// @ts-expect-error — null is not assignable to the serialize parameter
strCodec().serialize(null);

// ✗ a codec's serialize should not accept 'z' because it's not part of the ['x', 'y'] array.
// @ts-expect-error — "z" is not a valid parameter
enumCodec(["x", "y"]).serialize("z");
