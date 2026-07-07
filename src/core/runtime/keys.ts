/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The dotted URL key model: the separator constant, the template literal type
 * of a full key, and the helpers that build and split such keys. Everything
 * that touches a `section.codec` key goes through this file, so the runtime
 * and the type system share one definition.
 */

/** The character between a section prefix and a codec key. */
export const KEY_SEP = ".";
/** The type of `KEY_SEP`. */
export type KeySep = typeof KEY_SEP;

/**
 * A full dotted URL key: a section prefix, the separator, and a codec key,
 * as in `"bugs.page"`.
 */
export type Dotted<
  Section extends string,
  Codec extends string,
> = `${Section}${KeySep}${Codec}`;

/**
 * Builds a full URL key from a section prefix and a codec key.
 *
 * @param section The section prefix.
 * @param codec The codec key inside the section.
 * @returns The dotted key, typed precisely for literal inputs.
 */
export function innerKey<Section extends string, Codec extends string>(
  section: Section,
  codec: Codec,
): Dotted<Section, Codec> {
  return `${section}${KEY_SEP}${codec}`;
}

/**
 * Splits a full key into its section and codec parts. The result is precise
 * for literal keys, while a dynamic `string` widens to
 * `[string, string] | null`.
 *
 * @param fullKey The key as it appears in the URL.
 * @returns A labelled `[section, codec]` tuple, or `null` for a root key
 * that contains no separator.
 */
export function splitKey<Section extends string, Codec extends string>(
  fullKey: `${Section}${KeySep}${Codec}`,
): [section: Section, codec: Codec];
export function splitKey<T extends string>(
  fullKey: T,
): string extends T ? [section: string, codec: string] | null : null;
export function splitKey(
  fullKey: string,
): [section: string, codec: string] | null {
  const i = fullKey.indexOf(KEY_SEP);
  return i === -1 ? null : [fullKey.slice(0, i), fullKey.slice(i + 1)];
}

/**
 * Reads the section prefix of a key.
 *
 * @param fullKey The key as it appears in the URL.
 * @returns The part before the separator, or the whole key when there is no
 * section.
 */
export function sectionPrefix<T extends string>(
  fullKey: T,
): T extends `${infer Section}${KeySep}${string}` ? Section : T;
export function sectionPrefix(fullKey: string): string {
  return splitKey(fullKey)?.[0] ?? fullKey;
}
