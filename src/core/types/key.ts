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

// Type-level check that a string is a valid URL key: /^[A-Za-z][A-Za-z0-9_~-]*$/.

type Lower =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";
type Letter = Lower | Uppercase<Lower>;
type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type KeyChar = Letter | Digit | "_" | "~" | "-";

type AllKeyChars<S extends string> = S extends ""
  ? true
  : S extends `${infer H}${infer T}`
    ? H extends KeyChar
      ? AllKeyChars<T>
      : false
    : false;

/**
 * `true` if `S` matches the URL-key regex (letter first, then key chars).
 * @example `ValidKey<"sort_by">` → `true`; `ValidKey<"a.b">` → `false`
 */
export type ValidKey<S extends string> = S extends `${Letter}${string}`
  ? AllKeyChars<S>
  : false;
