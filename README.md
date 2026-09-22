# @canonical/superhref

Typed, composable URL search-parameter state.

[![npm version](https://img.shields.io/npm/v/%40canonical%2Fsuperhref)](https://www.npmjs.com/package/@canonical/superhref)
[![CI](https://github.com/canonical/superhref/actions/workflows/ci.yml/badge.svg)](https://github.com/canonical/superhref/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/%40canonical%2Fsuperhref)](./LICENSE)

`superhref` treats the URL query string as application state. Declare a codec schema once to get pure functions that read, write, and clear that state on any `URL`. The schema also creates a bound object whose methods return ready-to-use `href` strings. Because each state change is a link, the same code supports client-side navigation, server-side rendering, and pages without JavaScript.

Malformed input never throws. Codecs coerce hostile or hand-edited values to a default or `null`, so `?page=banana` resolves safely instead of raising an exception.

## Installation

```sh
npm install @canonical/superhref zod
```

Requires Node.js 20 or later, TypeScript 5.4 or later, and Zod 4.6. The package
ships ECMAScript modules (ESM) with TypeScript declarations.

## Quick start

```ts
import { superhref, zodCodec } from "@canonical/superhref";
import * as z from "zod";

const PageSchema = z.compile(
  z.codec(z.string().regex(/^[1-9]\d*$/), z.int().min(1), {
    decode: (value) => Number(value),
    encode: (value) => String(value),
  }),
);

const QueryParams = superhref({
  panel: z.enum(["overview", "version", "bugs"]),
  bugs: {
    severity: z.enum(["low", "medium", "high", "critical"]),
    page: zodCodec(PageSchema, { default: 1 }),
    q: z.string(),
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
import { superhref, withActions } from "@canonical/superhref";
import * as z from "zod";

const QueryParams = superhref(
  {
    bugs: withActions(
      {
        page: z.compile(z.string()),
        q: z.compile(z.string()),
      },
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

A schema leaf can be a synchronous, bidirectional Zod schema or a low-level
`Codec`. Use Zod schemas directly for ordinary URL values. Absent or invalid
input then resolves to `null`; wrap a schema in `zodCodec` only when it needs a
non-null default. Only `null` removes a key from the URL.

### Zod schemas

Place synchronous, bidirectional Zod schemas directly at root or section
leaves. Their encoded input must be URL text. Plain string schemas and enums
work as-is; use a Zod codec when the application value has another type.

```ts
const NavigationParams = superhref({
  panel: z.enum(["overview", "version", "bugs"]),
  version: { id: z.string() },
});
```

[`z.compile()`](https://zod.dev/blog/introducing-z-compile) is an optional
parsing optimization that avoids repeatedly walking schemas on a hot path.
Compilation does not change Zod's reverse encode path:

```ts
import { superhref, zodCodec } from "@canonical/superhref";
import * as z from "zod";

const PageSchema = z.compile(
  z.codec(z.string().regex(/^[1-9]\d*$/), z.int().min(1), {
    decode: (value) => Number(value),
    encode: (value) => String(value),
  }),
);
const StatusSchema = z.compile(z.enum(["open", "closed"]));

const QueryParams = superhref({
  page: zodCodec(PageSchema, { default: 1 }),
  status: StatusSchema,
});

QueryParams.parse(new URL("https://x.test/?page=3&status=open"));
// { page: 3, status: "open" }

QueryParams.parse(new URL("https://x.test/?page=bad"));
// { page: 1, status: null }
```

`zod` is a peer dependency, so applications control the version in their
bundle. Direct schemas use `safeParse`; absent or invalid URL input resolves to
`null`. `zodCodec` adds a configured `default` and validates it through Zod's
reverse encode path when the codec is constructed. Put defaults in
`zodCodec(schema, { default })`, not in Zod's `.default()`; optional and
nullable Zod schemas are unsupported because superhref models absence itself.
Zod's `.catch()` still takes precedence for a malformed value that is present.

Schemas must support Zod's reverse `encode` path. A patched value that violates
the schema can raise a `ZodError`; a unidirectional `.transform()` schema raises
`ZodEncodeError` whenever superhref serializes it. Use `z.codec()` for
transformations that must round-trip through a URL.

### Migrating from 0.1

Version 0.2 removes the built-in codec helpers:

| Removed helper | Replacement |
| --- | --- |
| `strCodec()` | `z.string()` |
| `strCodec({ default: value })` | `zodCodec(z.string(), { default: value })` |
| `enumCodec(values)` | `z.enum(values)` |
| `numCodec(options)` | Define a bidirectional `z.codec()` as above; wrap it in `zodCodec()` only when it needs a default. |

### Custom codecs

A custom codec is a plain object that satisfies the `Codec<T>` interface.
Implement `parse(raw: string | null): T` and
`serialize(value: T | null): string | null`. Keep `parse` total so it coerces
hostile input instead of throwing. Returning `null` from `serialize` removes
the key. Any value that round-trips through a string fits, including dates,
comma-separated lists, and bitmasks.

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
