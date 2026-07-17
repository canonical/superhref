/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The runtime context shared by every operation.
 */

import type { ActionMap } from "./bound.js";
import type {
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefSchema,
} from "./schema.js";
import type { Empty } from "./util.js";

/**
 * The runtime context every operation reads from.
 * Carries the schema `S` and the top level action map `A`. Both are needed
 * to produce a precisely typed bound object; operations that don't use the
 * actions can leave `A` at its `Empty` default.
 *
 * @typeParam S The schema shape.
 * @typeParam A The top level action map.
 */
export interface Ctx<
  S extends SuperhrefSchema = SuperhrefSchema,
  A extends ActionMap<SuperhrefPatch<S>, SuperhrefParsed<S>> = Empty,
> {
  schema: S;
  actions: A;
}
