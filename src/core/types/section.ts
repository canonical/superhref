/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codecs, Parsed } from "./codec.js";

/**
 * A patch function scoped to one section: takes a partial of that section's values and
 * returns the new search string. `null` deletes a key; `undefined`/absent leaves it
 * unchanged.
 */
export type SectionPatch<S> = (
  partial: { [K in keyof S]?: S[K] | null },
) => string;

/**
 * A section action: `(patch, state, ...args) => string`. When bound, `patch` and `state`
 * are supplied automatically, so the bound method keeps only the extra `...args`.
 */
export type SectionAction<S> = (
  patch: SectionPatch<S>,
  state: S,
  // biome-ignore lint/suspicious/noExplicitAny: variadic action args are intentionally open-ended
  ...args: any[]
) => string;

export type SectionActionMap<S> = Record<string, SectionAction<S>>;

/**
 * A section that has actions: its codecs plus a named-action map, under one URL prefix.
 * (A section with no actions is just a bare codecs map — `{ id: codec, … }`.) `A` keeps
 * the concrete action map so each bound method keeps its argument types.
 */
export type Section<
  S extends Codecs = Codecs,
  A extends SectionActionMap<Parsed<S>> = SectionActionMap<Parsed<S>>,
> = {
  codecs: S;
  actions: A;
};
