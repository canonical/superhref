/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ActionMap, BoundSuperhref } from "../types/bound.js";
import type { Ctx } from "../types/context.js";
import type {
  ConfigValue,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
  SuperhrefSchema,
} from "../types/schema.js";
import type { AnyFunction, Empty } from "../types/util.js";
import { clear } from "./clear.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import { parse } from "./parse.js";
import { patch } from "./patch.js";

// biome-ignore lint/suspicious/noExplicitAny: bound object is built by runtime key indexing; precise shape restored by the cast at return
type Dynamic = Record<string, any>;

/**
 * Creates a query params model bound to the provided URL. The value of each
 * parameter can be read as `.parameterName`, or as
 * `.sectionName.parameterName` inside a section. The model also provides
 * methods that produce a new URL search string; for example
 * `.set("parameter", value)` returns a new search string with that parameter
 * updated. The model itself is never mutated.
 *
 * @typeParam S The schema shape.
 * @typeParam A The top level action map.
 * @param ctx The runtime context carrying the schema and actions.
 * @param url The URL the model reads from; it is not modified.
 * @returns The bound object with values, section handles, and methods.
 */
export const bind = <
  S extends SuperhrefSchema,
  A extends ActionMap<SuperhrefPatch<S>, SuperhrefParsed<S>> = Empty,
>(
  ctx: Ctx<S, A>,
  url: URL,
): BoundSuperhref<S, A> => {
  const patchStr = (partial: Dynamic) =>
    patch(ctx, url, partial as SuperhrefPatchInput<S>).search || "?";
  const state: Dynamic = parse(ctx, url);

  const queryParams: Dynamic = {
    patch: patchStr,
    clear: () => clear(ctx, url).search || "?",
    set: (key: string, value: unknown) => patchStr({ [key]: value }),
  };

  for (const [sectionKey, value] of Object.entries(ctx.schema)) {
    queryParams[sectionKey] = buildSection(sectionKey, value, state, patchStr);
  }

  for (const [actionName, actionHandler] of Object.entries(ctx.actions))
    queryParams[actionName] = (...args: unknown[]) =>
      (actionHandler as AnyFunction)(patchStr, state, ...args);

  return queryParams as unknown as BoundSuperhref<S, A>;
};

function buildSection(
  sectionKey: string,
  value: ConfigValue,
  state: Dynamic,
  patchStr: (partial: Dynamic) => string,
) {
  if (isCodec(value)) return state[sectionKey];

  const { codecs, actions } = sectionOf(value);
  const sectionPatch = (partial: Dynamic): string =>
    patchStr({ [sectionKey]: partial });

  const section: Dynamic = {
    patch: sectionPatch,
    set: (ck: string, v: unknown) => patchStr({ [sectionKey]: { [ck]: v } }),
  };

  for (const subkey of Object.keys(codecs))
    section[subkey] = state[sectionKey][subkey];

  for (const [actionName, actionHandler] of Object.entries(actions)) {
    section[actionName] = (...args: unknown[]) =>
      actionHandler(sectionPatch, state[sectionKey], ...args);
  }
  return section;
}
