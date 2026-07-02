/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ActionMap, BoundSuperhref } from "../types/bound.js";
import type {
  SectionValue,
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
} from "../types/config.js";
import type { Empty } from "../types/util.js";
import { clear } from "./clear.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import type { AnyFunction, Ctx } from "./context.js";
import { parse } from "./parse.js";
import { patch } from "./patch.js";

// bind is the dynamic zone: it builds the bound object by walking the config at runtime by
// indexing parsed `state` and assigning by runtime key, none of it statically typeable. So
// those values use this one `any` alias; the precise public shape is restored by the cast
// at return.
// biome-ignore lint/suspicious/noExplicitAny: bound object is built by runtime key indexing; precise shape restored by the cast at return
type Dynamic = Record<string, any>;

/**
 * Creates a queryParams model bound to the provided url with ability to read the
 * value of each parameter `.parameterName` or parameter of a section `.sectionName.parameterName`
 * It also provides methods to generate new url string. For example `.set('parameter', value)`
 * will return a new url string with the parameter updated. The model itself is not mutated
 */
export const bind = <
  C extends SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
>(
  ctx: Ctx<C, A>,
  url: URL,
): BoundSuperhref<C, A> => {
  const patchStr = (partial: Dynamic) =>
    patch(ctx, url, partial as SuperhrefPatchInput<C>).search;
  const state: Dynamic = parse(ctx, url);

  const queryParams: Dynamic = {
    patch: patchStr,
    clear: () => clear(ctx, url).search,
    set: (key: string, value: unknown) => patchStr({ [key]: value }),
  };

  for (const [sectionKey, value] of Object.entries(ctx.config)) {
    queryParams[sectionKey] = buildSection(sectionKey, value, state, patchStr);
  }

  for (const [an, fn] of Object.entries(ctx.actions))
    queryParams[an] = (...args: unknown[]) =>
      (fn as AnyFunction)(patchStr, state, ...args);

  return queryParams as unknown as BoundSuperhref<C, A>;
};

function buildSection(
  sectionKey: string,
  value: SectionValue,
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
