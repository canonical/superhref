/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { bind } from "./core/runtime/bind.js";
import { clear } from "./core/runtime/clear.js";
import { parse } from "./core/runtime/parse.js";
import { patch } from "./core/runtime/patch.js";
import { assertValidSchema } from "./core/runtime/schema-guard.js";
import type { ActionMap } from "./core/types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "./core/types/config.js";
import type { Ctx } from "./core/types/context.js";
import type { Superhref } from "./core/types/superhref.js";
import type { Empty } from "./core/types/util.js";
import type { ActionNameCollisions } from "./core/types/validate/actions.js";
import type { ValidateSchemaKeys } from "./core/types/validate/schema.js";

/**
 * Build a superhref instance: a set of pure functions over a `URL` you pass in each time
 * plus a way to create a bound object for reading and writing the URL's search params.
 *
 * @typeParam C The schema shape, inferred from `schema`.
 * @typeParam A The top level action map, inferred from `options.actions`.
 * @param schema The schema. Wrapping it in `ValidateSchemaKeys` is what
 * surfaces a bad key as an error at the key itself, while leaving valid keys
 * alone so `C` still infers from the schema.
 * @param options Top level actions. `NoInfer<C>` makes the actions check
 * against `C` without widening it; without it, an action whose name clashes
 * with a key collapses `C` and lands the error on the schema.
 * @returns The instance of pure functions: `parse`, `patch`, `clear`, and
 * `bind`.
 */
export function superhref<
  const C extends SuperhrefConfig,
  const A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
>(
  schema: ValidateSchemaKeys<C>,
  options?: {
    actions?: A &
      ActionMap<SuperhrefPatch<NoInfer<C>>, SuperhrefParsed<NoInfer<C>>> &
      ActionNameCollisions<NoInfer<C>>;
  },
): Superhref<C, A> {
  const ctx: Ctx<C, A> = {
    schema: schema as unknown as C,
    actions: (options?.actions ?? {}) as A,
  };
  assertValidSchema(ctx);

  return {
    parse: (url) => parse(ctx, url),
    patch: (url, partial) => patch(ctx, url, partial),
    clear: (url) => clear(ctx, url),
    bind: (url) => bind(ctx, url),
  };
}
