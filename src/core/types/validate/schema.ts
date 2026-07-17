/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Compile time validation of the schema's top level keys: syntax, reserved
 * names, and each section's own problems, surfaced as error string types at
 * the offending key.
 */

import type { RESERVED_ROOT_NAMES } from "../../runtime/schema-guard.js";
import type { AnyCodec } from "../codec.js";
import type { SuperhrefConfig } from "../config.js";
import type { InvalidKeyMsg, ValidKey } from "./key.js";
import type { SectionHasProblem, SectionMsg } from "./section.js";

/**
 * Method names on the bound object, forbidden as schema keys because a key
 * would shadow them.
 */
export type ReservedRoot = (typeof RESERVED_ROOT_NAMES)[number];

/**
 * Checks each schema key. A bad key, meaning invalid syntax, a reserved
 * name, or a section with its own problem, has its value replaced by an
 * error string type; a good key keeps its real value. Since the value (a
 * codec or section) can't be that string, a bad schema fails to compile
 * exactly at the offending key.
 *
 * @example `superhref({ set: enumCodec(P) })` errors at `set`, a reserved key.
 */
export type ValidateSchemaKeys<C extends SuperhrefConfig> = {
  [K in keyof C]: ValidKey<K & string> extends true
    ? K extends ReservedRoot
      ? `superhref: schema key "${K & string}" is reserved`
      : C[K] extends AnyCodec
        ? C[K]
        : SectionHasProblem<C[K]> extends true
          ? SectionMsg<C, K>
          : C[K]
    : InvalidKeyMsg<"schema", K & string>;
};

/** The schema's top level key names, as strings. */
export type AllRootMemberNames<C> = keyof C & string;
