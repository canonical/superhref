/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { AllRootMemberNames, ReservedRoot } from "./schema.js";

export type ActionNameCollisions<S> = {
  [N in
    | AllRootMemberNames<S>
    | ReservedRoot]?: `superhref: action "${N}" collides with the schema key or instance method "${N}"`;
};
