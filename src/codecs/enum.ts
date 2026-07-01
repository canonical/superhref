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

import type { Codec } from "../core/types/codec.js";

/**
 * One of a fixed set of string literals; anything else coerces to `default`.
 * `enumCodec(["a", "b"])` is `Codec<"a" | "b" | undefined>`. `URLSearchParams`
 * handles any encoding at the URL boundary, so the membership check and the written
 * value are the plain literal.
 */
export const enumCodec = <const T extends readonly string[]>(
  values: T,
  opts?: { default?: T[number] },
): Codec<T[number] | undefined> => ({
  parse: (raw) =>
    raw != null && (values as readonly string[]).includes(raw)
      ? (raw as T[number])
      : opts?.default,
  serialize: (v) => (v === undefined ? null : v),
  default: opts?.default,
});
