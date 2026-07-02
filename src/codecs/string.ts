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
 * A plain string: `parse` is almost always the identity and `serialize` returns the
 * string as-is. With a `default` the value type is `string`, otherwise
 * `string | undefined`.
 *
 * Absence → `default` (or `undefined`). An empty string normally serializes to
 * absence — but when a non-empty `default` exists, `""` is written as an explicit
 * `?key=` so it can't silently resurrect the default on re-parse.
 */
export function strCodec(opts: { default: string }): Codec<string>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string | undefined>;
export function strCodec(opts?: {
  default?: string;
}): Codec<string> | Codec<string | undefined> {
  return {
    parse: (raw) => (raw === null ? opts?.default : raw),
    serialize: (v) => {
      if (v === undefined) return null;
      if (v === "") return opts?.default ? "" : null;
      return v;
    },
    default: opts?.default,
  } satisfies Codec<string | undefined>;
}
