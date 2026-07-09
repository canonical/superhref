/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The section types: the section scoped patch function, the action shapes,
 * and the `Section` pair that binds codecs and actions under one URL prefix.
 */

import type { Codecs, Parsed } from "./codec.js";

/**
 * A patch function scoped to one section: takes a partial of that section's values and
 * returns the new search string. `null` deletes a key; `undefined` or absence leaves it
 * unchanged.
 */
export type SectionPatch<S extends Record<string, unknown>> = (
  partial: { [K in keyof S]?: S[K] | null },
) => string;

export type Action<P, S> = (
  patch: P,
  state: S,
  // biome-ignore lint/suspicious/noExplicitAny: variadic action args are intentionally unconstrained
  ...args: any[]
) => string;

/**
 * A section action: `(patch, state, ...args) => string`. When bound, `patch` and `state`
 * are supplied automatically, so the bound method keeps only the extra `...args`.
 */
export type SectionAction<S extends Record<string, unknown>> = Action<
  SectionPatch<S>,
  S
>;

export type SectionActionMap<S extends Record<string, unknown>> = Record<
  string,
  SectionAction<S>
>;

/**
 * A section that has actions: its codecs plus a named action map, under one URL prefix.
 * (A section with no actions is just a bare codecs map such as
 * `{ id: codec }`.) `A` keeps
 * the concrete action map so each bound method keeps its argument types.
 */
export type Section<S extends Codecs, A extends SectionActionMap<Parsed<S>>> = {
  codecs: S;
  actions: A;
};
