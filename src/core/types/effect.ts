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

/**
 * A function run after a patch has written its keys, mutating the in-progress URL's
 * `URLSearchParams` directly. `touched` is the set of full dotted key names the patch
 * named — whether or not a value actually changed (re-submitting the same value still
 * counts as touched).
 *
 * Effects run in array order, once per patch, and do not cascade: an effect's own writes
 * never re-trigger other effects, and never extend `touched`.
 *
 * `Req` is the set of keys (a root key, or a dotted `section.codec`) the effect depends
 * on, surfaced at runtime as `requires`. Naming them in the type lets them be checked
 * against the available keys, turning a typo into a compile error rather than an effect
 * that silently never runs.
 */
export type SuperhrefEffect<Req extends string = string> = ((
  next: URLSearchParams,
  touched: ReadonlyArray<string>,
) => void) & { requires?: readonly Req[] };
