/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

export const KEY_SEP = ".";
export type KeySep = typeof KEY_SEP;

/** A full dotted URL key: a section prefix, the separator, and a codec key (e.g. `"bugs.page"`). */
export type Dotted<
  Section extends string,
  Codec extends string,
> = `${Section}${KeySep}${Codec}`;

/** Build a full URL key from a section prefix and a codec key. */
export const innerKey = <Section extends string, Codec extends string>(
  section: Section,
  codec: Codec,
): Dotted<Section, Codec> => `${section}${KEY_SEP}${codec}`;

/**
 * Split a full key into `[section, codec]`, or `null` for a root key (no separator).
 * Precise for literal keys; a dynamic `string` widens to `[string, string] | null`.
 */
export function splitKey<T extends string>(
  fullKey: T,
): string extends T
  ? [section: string, codec: string] | null
  : T extends `${infer Section}${KeySep}${infer Codec}`
    ? [section: Section, codec: Codec]
    : null;
export function splitKey(
  fullKey: string,
): [section: string, codec: string] | null {
  const i = fullKey.indexOf(KEY_SEP);
  return i === -1 ? null : [fullKey.slice(0, i), fullKey.slice(i + 1)];
}

/** The part before the separator, or the whole key when there's no section. */
export function sectionPrefix<T extends string>(
  fullKey: T,
): T extends `${infer Section}${KeySep}${string}` ? Section : T;
export function sectionPrefix(fullKey: string): string {
  return splitKey(fullKey)?.[0] ?? fullKey;
}
