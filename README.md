# superhref

> Typed, composable URL search-param state.

`superhref` is a small, zero-dependency TypeScript library for managing URL search-param state. It does not use a store and holds nothing in memory. Instead, the URL acts as the single source of truth. An instance of `superhref` is simply a typed set of pure functions that operate on a `URL` object you provide.

You will primarily interact with it using **`bind(url)`**. This function reads the URL into typed values and gives you back a method for any change you might want to make, such as `set`, section actions, and cross-section actions. **Every method returns an `href`**, which is a `url.search` string. Because a state change is just a string, you can drop it right into an `<a href>` to make it work with **JavaScript disabled**, or pass it to your router when JavaScript is running. Each method preserves the rest of the URL's state during the change. This means independent parts of your UI, like an open panel, a filtered table, or a sorted list, will never interfere with each other.

Under the hood, the same instance gives you access to the lower-level core tools it relies on. You can use `parse(url)` for a typed read, which is great for server loaders, and `patch(url, partial)` for a direct write that returns a brand new `URL` object.

## Why

Modern applications often use URL parameters to handle UI state. This enables deep-linking, server rendering, easy sharing, back and forward navigation, and accessibility even without JavaScript. A single page might manage several independent pieces of state at the same time, such as an open panel, a filtered and paginated table, a sorting preference, or a search box. Usually, each of these features gets its own key prefix. If you do not use a library, every component has to manually update `URLSearchParams`, handle its own parsing, and manage cross-component rules by hand. For example, you might have to write custom logic to ensure that closing a panel also clears the `version.*` parameters, or that changing a filter resets the current page.

`superhref` solves this by making everything declarative. **Codecs** provide types for each key, **actions** allow you to compose updates across multiple keys, and **effects** make sure the rest of the URL stays consistent after every change.

## Installation

```bash
npm install @canonical/superhref
```

## Usage

```ts
import {
  superhref,
  discriminatorEffect,
  enumCodec,
  strCodec,
  numCodec,
  withActions,
} from "@canonical/superhref";

export const QueryParamsSchema = superhref(
  {
    // a root codec points to an unprefixed key:           ?panel=...
    panel: enumCodec(["overview", "version", "bugs"]),

    // a bare codecs map creates a section with no actions:   ?version.id=...
    version: { id: strCodec() },

    // withActions creates a section with actions:        ?bugs.severity=... &bugs.page=...
    bugs: withActions(
      { severity: enumCodec(["low", "medium", "high", "critical"]), page: numCodec({ default: 1, min: 1 }) },
      {
        // `patch` and `state` are typed from the codecs automatically
        nextPage: (patch, state) => patch({ page: (state.page ?? 1) + 1 }),
        reset: (patch) => patch({ severity: null, page: null }),
      },
    ),
  },
  {
    // run after every patch. Here, switching the panel clears the section you just left.
    effects: [discriminatorEffect("panel", ["overview", "version", "bugs"])],
    // top-level actions can write across sections
    actions: {
      openVersion: (patch, _state, id: string) =>
        patch({ panel: "version", version: { id } }),
      closePanel: (patch) => patch({ panel: null }),
    },
  },
);
```

The **`bind(url)`** function is what you will use for your day-to-day work. It extracts the current values and provides a method for every possible change, with each method producing a new `href`.

```ts
const qp = QueryParamsSchema.bind(page.url);

// current values, typed:
qp.panel; // "bugs"
qp.bugs.severity; // "high"

// every change returns an href (a url.search string):
qp.set("panel", "version"); // returns "?panel=version" (typed per key)
qp.bugs.set("severity", "critical"); // returns "?bugs.severity=critical"
qp.bugs.nextPage(); // state-aware action, via the bind closure
qp.openVersion("1.2.3"); // returns "?panel=version&version.id=1.2.3"
qp.closePanel(); // discriminator also clears version.*
```

You can drop the output directly into your HTML markup. This means your links will work perfectly fine even if JavaScript is turned off, and they will route correctly through your application when JavaScript is enabled.

```svelte
<a href={qp.bugs.nextPage()}>Next</a>
<button onclick={() => goto(qp.bugs.set("severity", "critical"))}>Critical only</button>
```

### Lower-level: `parse`, `patch`, `clear`

The `bind` function is built on top of a few direct, pure functions that are also available on the instance. Keep in mind that none of these functions will mutate the `URL` object you pass into them.

```ts
ui.parse(new URL("https://x/?panel=bugs&bugs.severity=high"));
// returns { panel: "bugs", version: { id: undefined }, bugs: { severity: "high", page: 1 } }

ui.patch(new URL("https://x/"), { panel: "bugs", bugs: { severity: "critical" } }).search;
// returns "?panel=bugs&bugs.severity=critical"

ui.clear(new URL("https://x/?panel=bugs&utm=keep")).search;
// returns "?utm=keep" (only owned keys are removed)
```

## Core ideas

- **The URL is the state.** There is no secondary copy of your data. Operations are strictly reads using `parse` or replacements using `patch`. Any reactivity happens right at the call site.
- **Sections** help you namespace your state under a specific key prefix, like `bugs.severity` or `bugs.page`. Sections work well together because their prefixes do not overlap.
- **Codecs** provide an encode and decode pair for a single key. They are designed to coerce invalid or hostile input instead of throwing errors. This guarantees that a manually edited or shared URL will never cause your page to crash.
- **Effects** run after every patch and can interact with any key. This allows you to write rules that span across multiple sections in one central place, rather than duplicating the logic in every component.
- **Actions** are named functions that write to the URL. They take the form `(patch, state, ...args) => href`. You can define them per-section using `withActions` or at the top level for cross-section updates using `options.actions`.

## API

### `superhref(config, options?)`

Builds an instance. Each `config` value is one of three shapes:

 - root codec:`panel: enumCodec(PANELS)` => `?panel=...` 
 - bare codecs map (section, no actions): `version: { id: strCodec() }` => `?version.id=...`
 - section with actions: `bugs: withActions({...}, {...})` => `?bugs.[key]=...` 

The `options.effects` functions run after every patch, while `options.actions` define your top-level actions. The entire configuration is validated **at compile time**. This means that if you use reserved or incorrectly formatted keys, create name collisions, or write an effect that requires an unknown key, TypeScript will immediately flag it as a type error.

Instance methods (all pure, never mutating the input `URL`):

- `parse(url): State` returns your typed, nested state. You get one value for each root key and one object for each section.
- `patch(url, partial): URL` returns a new URL object with your updated keys and all effects applied.
- `clear(url): URL` returns a new URL object with all owned keys completely removed. Note that this method does not trigger any effects.
- `bind(url): Bound` returns the object shown in the examples above, which includes your hoisted values and all the methods needed to generate new href strings.

### `null` vs `undefined` in a patch

- Using `null` deletes a key. If you set an entire section to `null`, it will clear that specific prefix entirely.
- Using `undefined` or omitting a key will leave the current value exactly as it is.
- Values are written exactly as provided. Even if a value matches a codec's default setting, it will still appear in the URL. If you want to remove it, you must explicitly use `null`.

### Codecs

```ts
strCodec(opts?: { default?: string }): Codec<string | undefined>
numCodec(opts?: { default?: number; integer?: boolean; min?: number; max?: number }): Codec<number | undefined>
enumCodec(values: readonly string[], opts?: { default?: string }): Codec<<union> | undefined>
```

- `strCodec` behaves mostly like an identity function. If a value is absent, it falls back to the default. An empty string will serialize to an absence. However, if you have a non-empty default, an empty string will write `?key=` explicitly to ensure it does not accidentally parse back into the default value.
- `numCodec` will coerce values instead of throwing errors. If a value is absent, empty, or not a number, it will fall back to the default. It also clamps out-of-range numbers to your specified min and max bounds.
- `enumCodec(["low", "high"])` resolves to `Codec<"low" | "high" | undefined>`. Parsing simply checks if the value belongs to the group. You can pass the values directly or use a variable typed with `as const` to get an exact union type.
- more to be added if needed. You can write your own codec

### `withActions(codecs, actions)`

This is the way to attach actions to a section. It uses two separate arguments so each action's `patch` and `state` are typed from the codecs with no extra annotations needed. A section without actions is simply a bare codecs map.

### `discriminatorEffect(key, controlled)`

When a target `key` is modified, this effect clears every `controlled` prefix except for the one that matches the new value. For example, switching the active panel will clear the state of the panels you navigated away from. The `key` is strictly checked against your configuration, so any typos will be caught as compile-time errors.

## Development

Requires Node.js 20+.
```bash
npm install         # install dependencies
npm run build       # compile to dist/ (ESM + type declarations)
npm test            # run the test suite
npm run check       # lint, format check (Biome) and type-check
npm run check:fix   # apply Biome autofixes and type-check
```

Linting and formatting use [Biome](https://biomejs.dev/) via Canonical's shared [`@canonical/biome-config`](https://www.npmjs.com/package/@canonical/biome-config). The TypeScript configuration is a standalone `tsconfig.json` inspired by [`@canonical/typescript-config`](https://www.npmjs.com/package/@canonical/typescript-config).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening an issue or pull request. This project follows the [Ubuntu Code of Conduct](./CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](./LICENSE). Copyright © Canonical Ltd.
