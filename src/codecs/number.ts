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
 * Number with coercion: absent, empty (`?page=`), non-numeric, or non-integer
 * (with `integer`) input falls back to `default`; out-of-range input clamps to
 * `min`/`max`. (`""` must be treated as missing — `Number("")` is `0`, a classic
 * trap for hand-edited URLs.) Digits need no URL-encoding, so the token is the
 * plain numeric string.
 */
export const numCodec = (opts?: {
  default?: number;
  integer?: boolean;
  min?: number;
  max?: number;
}): Codec<number | undefined> => ({
  parse: (raw) => {
    if (raw == null || raw === "") return opts?.default;

    const n = Number(raw);
    if (!Number.isFinite(n)) return opts?.default;

    if (opts?.integer && !Number.isInteger(n)) return opts?.default;
    if (opts?.min != null && n < opts.min) return opts.min;
    if (opts?.max != null && n > opts.max) return opts.max;
    return n;
  },
  serialize: (v) => (v === undefined ? null : String(v)),
  default: opts?.default,
});
