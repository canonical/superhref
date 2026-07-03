/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Compile time validation of the config's top level keys: syntax, reserved
 * names, and each section's own problems, surfaced as error string types at
 * the offending key.
 */

import type { AnyCodec } from "../codec.js";
import type { ValidKey } from "../key.js";
import type { SectionHasProblem, SectionMsg } from "./section.js";

/**
 * Method names on the bound object, forbidden as config keys because a key
 * would shadow them.
 */
export type ReservedRoot = "patch" | "clear" | "set";

/**
 * Checks each config key. A bad key, meaning invalid syntax, a reserved
 * name, or a section with its own problem, has its value replaced by an
 * error string type; a good key keeps its real value. Since the value (a
 * codec or section) can't BE that string, a bad config fails to compile
 * exactly at the offending key.
 *
 * Each key is checked on its own (not through a type that folds over the whole config),
 * so the config's other keys still infer their precise types.
 * @example `superhref({ set: enumCodec(P) })` errors at `set`, a reserved key.
 */
export type ValidateConfigKeys<C> = {
  [K in keyof C]: ValidKey<K & string> extends true
    ? K extends ReservedRoot
      ? `superhref: config key "${K & string}" is reserved (it would shadow the bound .${K & string})`
      : C[K] extends AnyCodec
        ? C[K]
        : SectionHasProblem<C[K]> extends true
          ? SectionMsg<C, K>
          : C[K]
    : `superhref: config key "${K & string}" is not a valid URL key (letters/digits/_~- only, must start with a letter; "." is reserved)`;
};

/** The config's top level key names, as strings. */
export type AllRootMemberNames<C> = keyof C & string;
