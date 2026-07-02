/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { bind } from "./core/runtime/bind.js";
import { clear } from "./core/runtime/clear.js";
import { parse } from "./core/runtime/parse.js";
import { patch } from "./core/runtime/patch.js";
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
import type { ValidateConfigKeys } from "./core/types/validate/config.js";

/**
 * Build a superhref instance: a set of pure functions over a `URL` you pass in each time
 * (it holds no state and touches no globals). `config` maps each key to a root codec, a
 * bare codecs map (a section with no actions), or `withActions(...)` (a section with
 * actions); `options.actions` are top-level actions.
 *
 * The config is validated entirely at compile time, each error landing at the offending
 * key: reserved or mis-syntaxed keys, a section's own naming problems, and an action that
 * clashes with a key or method.
 * Nothing is re-checked at runtime, so a config that bypasses the types (plain JS, `as any`)
 * is trusted as written.
 */
export function superhref<
  const C extends SuperhrefConfig,
  const A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
>(
  // Wrapping the config in `ValidateConfigKeys` is what surfaces a bad key as an error at
  // the key itself, while leaving valid keys alone so `C` still infers from the config.
  config: ValidateConfigKeys<C>,
  options?: {
    // `NoInfer<C>` so the actions only check against `C` and never widen it — without it, an
    // action whose name clashes with a key collapses `C`, landing the error on the config.
    actions?: A &
      ActionMap<SuperhrefPatch<NoInfer<C>>, SuperhrefParsed<NoInfer<C>>> &
      ActionNameCollisions<NoInfer<C>>;
  },
): Superhref<C, A> {
  const ctx: Ctx<C, A> = {
    config: config as unknown as C,
    actions: (options?.actions ?? {}) as A,
  };

  // Every method here is genuinely typed — no casts at this boundary (`bind` handles its
  // own dynamic build internally).
  return {
    parse: (url) => parse(ctx, url),
    patch: (url, partial) => patch(ctx, url, partial),
    clear: (url) => clear(ctx, url),
    bind: (url) => bind(ctx, url),
  };
}
