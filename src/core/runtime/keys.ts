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

export const KEY_SEP = ".";
export type KeySep = typeof KEY_SEP;

/** Build a full URL key from a section prefix and a codec key. */
export const innerKey = (section: string, codec: string): string =>
  `${section}${KEY_SEP}${codec}`;

/** Split a full key into `[section, codec]`, or `null` for a root key (no separator). */
export const splitKey = (fullKey: string): [string, string] | null => {
  const i = fullKey.indexOf(KEY_SEP);
  return i === -1 ? null : [fullKey.slice(0, i), fullKey.slice(i + 1)];
};

/** Get the part before the separator (or the key itself). */
export const sectionPrefix = (fullKey: string): string =>
  splitKey(fullKey)?.[0] ?? fullKey;
