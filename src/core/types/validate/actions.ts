/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { AllRootMemberNames, ReservedRoot } from "./schema.js";

/**
 * Maps every schema key and reserved instance method (`patch`/`clear`/`set`) to an
 * error string type, all optional. Used as a constraint on a top level
 * action map: an action whose name matches one of these would have to BE
 * that error string, and a function is not a string, so the clash surfaces
 * as a compile error at that action.
 */
export type ActionNameCollisions<C> = {
  [N in
    | AllRootMemberNames<C>
    | ReservedRoot]?: `superhref: action "${N}" collides with the schema key or instance method "${N}"`;
};
