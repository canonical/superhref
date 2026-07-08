/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../type-testing/expect.js";
import type {
  BoundSuperhref,
  ResolvedAction,
  ResolvedActions,
} from "./bound.js";
import type { Codec } from "./codec.js";
import type { SuperhrefParsed, SuperhrefPatch } from "./config.js";
import type { SectionPatch } from "./section.js";

// `ResolvedAction` strips the leading (patch, state) and keeps the caller's
// args and return type.
type OneArg = ResolvedAction<
  (patch: unknown, state: unknown, id: string) => string
>;
type _keepsArgAndReturn = ExpectTrue<Equal<OneArg, (id: string) => string>>;

type ManyArgs = ResolvedAction<
  (patch: unknown, state: unknown, a: number, b: boolean) => void
>;
type _keepsAllArgs = ExpectTrue<
  Equal<ManyArgs, (a: number, b: boolean) => void>
>;

// With no trailing args the resolved method takes no parameters.
type NoArgs = ResolvedAction<(patch: unknown, state: unknown) => string>;
type _zeroArg = ExpectTrue<Equal<NoArgs, () => string>>;

// Negative: a wrong arg type must not read as equal (guards against silently loosening to `any`).
type _wrongArgCaught = ExpectFalse<Equal<OneArg, (id: number) => string>>;

// Anything that is not a function resolves to `never`.
type _nonFunction = ExpectTrue<Equal<ResolvedAction<{ x: 1 }>, never>>;

// `ResolvedActions` applies the strip across a whole action map.
type Mapped = ResolvedActions<{
  open: (patch: unknown, state: unknown, id: string) => string;
  close: (patch: unknown, state: unknown) => string;
}>;
type _mapsEach = ExpectTrue<
  Equal<Mapped, { open: (id: string) => string; close: () => string }>
>;

type BugsState = { page: number; severity: string | undefined };
type Cfg = {
  panel: Codec<"open" | "closed">;
  q: Codec<string | undefined>;
  bugs: {
    codecs: { page: Codec<number>; severity: Codec<string | undefined> };
    actions: {
      jump: (
        patch: SectionPatch<BugsState>,
        state: BugsState,
        page: number,
      ) => string;
    };
  };
  filters: { tag: Codec<string | undefined> };
};
type Actions = {
  reset: (
    patch: SuperhrefPatch<Cfg>,
    state: SuperhrefParsed<Cfg>,
    hard: boolean,
  ) => string;
};

declare const queryParams: BoundSuperhref<Cfg, Actions>;

// The bound object exposes exactly the root props, sections, actions, and methods.
type _queryParamsKeys = ExpectTrue<
  Equal<
    keyof typeof queryParams,
    "panel" | "q" | "bugs" | "filters" | "reset" | "patch" | "clear" | "set"
  >
>;
type _sectionKeys = ExpectTrue<
  Equal<
    keyof typeof queryParams.bugs,
    "page" | "severity" | "jump" | "patch" | "set"
  >
>;

// Root values keep their codec value types.
type _rootKey = ExpectTrue<Equal<typeof queryParams.panel, "open" | "closed">>;
type _optionalRootKey = ExpectTrue<
  Equal<typeof queryParams.q, string | undefined>
>;

// Section values are read straight off the handle, typed per codec.
type _sectionValue = ExpectTrue<Equal<typeof queryParams.bugs.page, number>>;
type _secondSectionValue = ExpectTrue<
  Equal<typeof queryParams.filters.tag, string | undefined>
>;

// Bound actions only expect args to be provided.
type _sectionAction = ExpectTrue<
  Equal<typeof queryParams.bugs.jump, (page: number) => string>
>;
type _rootAction = ExpectTrue<
  Equal<typeof queryParams.reset, (hard: boolean) => string>
>;
type _clear = ExpectTrue<Equal<typeof queryParams.clear, () => string>>;

// `patch` returns string.
type _patchResult = ExpectTrue<
  Equal<ReturnType<typeof queryParams.patch>, string>
>;

//Actual calls verification
// @ts-expect-error a key the config doesn't own is rejected
queryParams.patch({ bogus: 1 });
queryParams.set("panel", "open");
queryParams.set("q", null);
queryParams.bugs.set("page", 2);
queryParams.bugs.set("severity", "high");
queryParams.bugs.patch({ page: null, severity: "low" });
queryParams.patch({ q: "crash", bugs: { page: 2 } });
// @ts-expect-error a key outside the section is rejected
queryParams.bugs.patch({ q: "x" });

type RootSet = typeof queryParams.set;
type SectionSet = typeof queryParams.bugs.set;
type _wrongRootValue = ExpectFalse<
  Extends<RootSet, (key: "panel", value: 3) => string>
>;
type _sectionKeyAtRoot = ExpectFalse<
  Extends<RootSet, (key: "bugs", value: never) => string>
>;
type _wrongSectionValue = ExpectFalse<
  Extends<SectionSet, (key: "page", value: "two") => string>
>;
type _mixedPair = ExpectFalse<
  Extends<SectionSet, (key: "severity", value: 2) => string>
>;
type _unknownSectionKey = ExpectFalse<
  Extends<SectionSet, (key: "nope", value: never) => string>
>;
