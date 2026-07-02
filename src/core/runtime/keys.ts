/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

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
