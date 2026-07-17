/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { RESERVED_ROOT_NAMES } from "../../runtime/schema-guard.js";
import type { AnyCodec } from "../codec.js";
import type { SuperhrefSchema } from "../schema.js";
import type { InvalidKeyMsg, ValidKey } from "./key.js";
import type { SectionHasProblem, SectionMsg } from "./section.js";

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
export type ValidateSchemaKeys<S extends SuperhrefSchema> = {
  [K in keyof S]: ValidKey<K & string> extends true
    ? K extends ReservedRoot
      ? `superhref: schema key "${K & string}" is reserved`
      : S[K] extends AnyCodec
        ? S[K]
        : SectionHasProblem<S[K]> extends true
          ? SectionMsg<S, K>
          : S[K]
    : InvalidKeyMsg<"schema", K & string>;
};

/** The schema's top level key names, as strings. */
export type AllRootMemberNames<S> = keyof S & string;
