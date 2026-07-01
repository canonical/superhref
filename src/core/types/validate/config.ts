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

import type { AnyCodec } from "../codec.js";
import type { ValidKey } from "../key.js";
import type { SectionHasProblem, SectionMsg } from "./section.js";

/** Method names on the bound object — forbidden as config keys, since a key would shadow them. */
export type ReservedRoot = "patch" | "clear" | "set";

/**
 * Checks each config key. A bad key — invalid syntax, a reserved name, or a section with
 * its own problem — has its value replaced by an error-string type; a good key keeps its
 * real value. Since the value (a codec or section) can't BE that string, a bad config
 * fails to type-check exactly at the offending key.
 *
 * Each key is checked on its own (not through a type that folds over the whole config),
 * so the config's other keys still infer their precise types.
 * @example `superhref({ set: enumCodec(P) })` errors at `set` — reserved.
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

/** The config's top-level key names, as strings. */
export type AllRootMemberNames<C> = keyof C & string;
