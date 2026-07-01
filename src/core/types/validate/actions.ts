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

import type { AllRootMemberNames, ReservedRoot } from "./config.js";

/**
 * Maps every config key and reserved instance method (`patch`/`clear`/`set`) to an
 * error-string type, all optional. Used as a constraint on a top-level action map: an
 * action whose name matches one of these would have to BE that error string, and a
 * function isn't a string — so the clash surfaces as a compile error at that action.
 */
export type ActionNameCollisions<C> = {
  [N in
    | AllRootMemberNames<C>
    | ReservedRoot]?: `superhref: action "${N}" collides with the config key or instance method "${N}"`;
};
