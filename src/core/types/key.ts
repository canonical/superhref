/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

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
 * `true` when `S` is a valid URL key: a letter followed by letters, digits,
 * or the characters `_`, `~`, and `-`, matching the regex
 * `/^[A-Za-z][A-Za-z0-9_~-]*$/`.
 * @example `ValidKey<"sort_by">` resolves to `true`; `ValidKey<"a.b">` resolves to `false`.
 */
export type ValidKey<S extends string> = S extends `${Letter}${string}`
  ? AllKeyChars<S>
  : false;
