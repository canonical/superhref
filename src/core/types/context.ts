/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The runtime context shared by every operation.
 */

import type { ActionMap } from "./bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "./config.js";
import type { SuperhrefEffect } from "./effect.js";
import type { Empty } from "./util.js";

/**
 * The runtime context every operation reads from.
 * Carries the schema `C`, the effects, and the top level action map `A`. Both are needed
 * to produce a precisely typed bound object; operations that don't use the
 * actions can leave `A` at its `Empty` default.
 *
 * @typeParam C The schema shape.
 * @typeParam A The top level action map.
 */
export interface Ctx<
  C extends SuperhrefConfig = SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
> {
  schema: C;
  /** Effects that run after each patch, in array order. */
  effects: SuperhrefEffect[];
  actions: A;
}
