/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type {
  Equal,
  ExpectFalse,
  ExpectTrue,
  Extends,
} from "../../../type-testing/expect.js";
import type { ActionMap } from "../bound.js";
import type { ActionNameCollisions } from "./actions.js";

// The collision map spans every schema key plus the reserved instance methods.
type Schema = { panel: unknown; bugs: unknown };
type _covered = ExpectTrue<
  Equal<
    keyof ActionNameCollisions<Schema>,
    "panel" | "bugs" | "patch" | "clear" | "set"
  >
>;

// The actions option is checked against the action map AND the collision
// constraint: an action named after a schema key or an instance method can't
// satisfy the error string slot the constraint puts at that name.
type ActionsArg = ActionMap<unknown, unknown> & ActionNameCollisions<Schema>;
type _cleanActionOk = ExpectTrue<
  Extends<{ openBug: () => string }, ActionsArg>
>;
type _schemaKeyClash = ExpectFalse<
  Extends<{ panel: () => string }, ActionsArg>
>;
type _methodClash = ExpectFalse<Extends<{ clear: () => string }, ActionsArg>>;
