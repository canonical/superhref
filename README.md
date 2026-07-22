# @canonical/superhref

Typed, composable URL search-parameter state.

[![npm version](https://img.shields.io/npm/v/%40canonical%2Fsuperhref)](https://www.npmjs.com/package/@canonical/superhref)
[![CI](https://github.com/canonical/superhref/actions/workflows/ci.yml/badge.svg)](https://github.com/canonical/superhref/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40canonical%2Fsuperhref)](./LICENSE)

`superhref` treats the URL query string as application state. Declare a codec schema once to get pure functions that read, write, and clear that state on any `URL`. The schema also creates a bound object whose methods return ready-to-use `href` strings. Because each state change is a link, the same code supports client-side navigation, server-side rendering, and pages without JavaScript.

Malformed input never throws. Codecs coerce hostile or hand-edited values to a default or `null`, so `?page=banana` resolves safely instead of raising an exception.

## Installation

```sh
npm install @canonical/superhref
```

Requires Node.js 20 or later. The package ships ECMAScript modules (ESM) with TypeScript declarations and has no runtime dependencies.

## Quick start

```ts
import { enumCodec, numCodec, strCodec, superhref } from "@canonical/superhref";

const QueryParams = superhref({
  panel: enumCodec(["overview", "version", "bugs"]),
  bugs: {
    severity: enumCodec(["low", "medium", "high", "critical"]),
    page: numCodec({ default: 1, integer: true, min: 1 }),
    q: strCodec(),
  },
});

const url = new URL("https://example.test/app?panel=bugs&bugs.severity=high");

// Read: fully typed, defaults applied, hostile input coerced.
const state = QueryParams.parse(url);
// { panel: "bugs", bugs: { severity: "high", page: 1, q: null } }

// Write: returns a new URL; nothing is mutated.
QueryParams.patch(url, { bugs: { page: 2 } }).search;
// "?panel=bugs&bugs.severity=high&bugs.page=2"

// Clear: removes only the keys the schema owns.
QueryParams.clear(new URL("https://example.test/app?panel=bugs&utm=keep")).search;
// "?utm=keep"
```

Nested sections become dotted URL keys such as `bugs.severity`. One schema can therefore own several independent widgets on the same page without key collisions.

## The bound object

`bind(url)` snapshots the URL into an object. Each parsed value becomes a property, and each mutation becomes a method that returns a search string. The result goes directly into an `<a href>`, so the pattern works without JavaScript:

```ts
const queryParams = QueryParams.bind(url);

queryParams.panel;                    // "bugs"
queryParams.bugs.severity;            // "high"

queryParams.set("panel", "overview"); // "?panel=overview&bugs.severity=high"
queryParams.bugs.set("page", 3);      // "?panel=bugs&bugs.severity=high&bugs.page=3"
queryParams.patch({ panel: null });   // "?bugs.severity=high"
queryParams.clear();                  // "?"
```

Because the bound object is a snapshot, reading a property never touches the URL again. Every method returns a new search string instead of mutating the URL.

### Actions

Actions define a state transition once in the schema instead of repeating patch logic at every call site. Each action receives `patch`, the current parsed state, and any declared arguments. `bind` removes the first two parameters, so the bound method accepts only your arguments and returns a search string:

```ts
import { numCodec, strCodec, superhref, withActions } from "@canonical/superhref";

const QueryParams = superhref(
  {
    bugs: withActions(
      { page: numCodec({ default: 1 }), q: strCodec() },
      {
        // Searching resets pagination, so encode that rule here.
        search: (patch, _state, q: string) => patch({ q, page: null }),
      },
    ),
  },
  {
    actions: { reset: (patch) => patch({ bugs: null }) },
  },
);

const queryParams = QueryParams.bind(new URL("https://example.test/app?bugs.q=old"));
queryParams.bugs.search("crash"); // "?bugs.q=crash"
queryParams.reset();              // "?"
```

## Codecs

A codec is a `parse`/`serialize` pair for one parameter. It converts a raw URL value to a typed value and back. The built-in codecs never throw because invalid input resolves to the codec's `default`, or to `null` when no default exists. A `default` also narrows the parsed type: `numCodec({ default: 1 })` returns `number`, while `numCodec()` returns `number | null`. Only `null` removes a key from the URL.

### `strCodec(opts?)`

The string codec passes strings through unchanged. An absent key resolves to the default. However, the empty string is a real value: it serializes as an explicit `?key=` and parses back to `""` rather than the default.

```ts
const S = superhref({ q: strCodec(), tag: strCodec({ default: "all" }) });

S.parse(new URL("https://x.test/")).tag;          // "all"
S.patch(new URL("https://x.test/"), { q: "" }).search; // "?q="
S.parse(new URL("https://x.test/?q=")).q;         // ""
```

### `numCodec(opts?)`

The number codec coerces invalid input instead of throwing. Absent, empty, or nonnumeric input resolves to the default. An empty value counts as missing because `Number("")` evaluates to `0`, a common trap with hand-edited URLs. With `integer: true`, fractional input also resolves to the default. Values outside `min` or `max` clamp to the nearest bound instead of being rejected.

```ts
const S = superhref({ page: numCodec({ default: 1, integer: true, min: 1, max: 500 }) });

S.parse(new URL("https://x.test/?page=banana")).page; // 1
S.parse(new URL("https://x.test/?page=2.5")).page;    // 1
S.parse(new URL("https://x.test/?page=9999")).page;   // 500
```

### `enumCodec(values, opts?)`

The enum codec accepts only members of `values`. Anything else, including an absent key, resolves to the default. The parsed value retains the literal union type of `values`, so the rest of your code can switch on it exhaustively.

```ts
const S = superhref({ sort: enumCodec(["asc", "desc"], { default: "asc" }) });

S.parse(new URL("https://x.test/?sort=DESC")).sort; // "asc" (case matters)
S.parse(new URL("https://x.test/")).sort;           // "asc"
```

### Custom codecs

A custom codec is a plain object that satisfies the `Codec<T>` interface. Implement `parse(raw: string | null): T` and `serialize(value: T): string | null`. Keep `parse` total so it coerces hostile input instead of throwing. Any value that round-trips through a string fits, including dates, comma-separated lists, and bitmasks.

## API summary

`superhref(schema, options?)` validates the schema when you create it. It rejects reserved keys such as `patch`, `clear`, and `set` at compile time and runtime. It returns four pure functions:

- `parse(url)` returns the typed state after applying defaults.
- `patch(url, partial)` returns a new `URL` with the partial state merged in. `null` removes a key, and TypeScript rejects unknown keys at compile time.
- `clear(url)` returns a new `URL` with only the schema-owned keys removed, preserving foreign parameters.
- `bind(url)` returns the bound object described above.

All four functions are pure. Each receives the `URL` explicitly, and none mutates it. This design keeps the library framework-agnostic and easy to test.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, checks, and the pull-request workflow.

## License

[LGPL-3.0-only](./LICENSE), Copyright 2026 Canonical Ltd.
