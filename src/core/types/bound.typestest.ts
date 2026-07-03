/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
} from "../../type-testing/expect.js";
import type { ResolvedAction, ResolvedActions } from "./bound.js";

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
