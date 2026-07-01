// This file is part of superhref, a typed, composable URL search-param state library.
//
// Copyright 2026 Canonical Ltd.
//
// SPDX-License-Identifier: LGPL-3.0-only
//
// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU Lesser General Public License version 3, as published by
// the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranties of MERCHANTABILITY, SATISFACTORY
// QUALITY, or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
// License for more details.
//
// You should have received a copy of the GNU Lesser General Public License along
// with this program.  If not, see http://www.gnu.org/licenses/.

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
