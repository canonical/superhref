/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ActionMap } from "../types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "../types/config.js";
import type { Empty } from "../types/util.js";

// biome-ignore lint/suspicious/noExplicitAny: generic function alias for heterogeneous action signatures
export type AnyFunction = (...args: any[]) => any;

/**
 * The runtime context every operation reads from — pure data, no state. Carries the config
 * `C` and the top-level action map `A`. Both are needed to produce a precisely-typed bound
 * object; operations that don't use the actions can leave `A` at its `Empty` default.
 */
export interface Ctx<
  C extends SuperhrefConfig = SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
> {
  config: C;
  actions: A;
}
