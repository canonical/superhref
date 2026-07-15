/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { sectionPrefix } from "../core/runtime/keys.js";
import type { SuperhrefEffect } from "../core/types/effect.js";

/**
 * When `key` is touched, clears every `controlled` prefix except the one
 * matching the new value. Switching a `panel` key, for example, clears the
 * URL state of the panels you switched away from. A `controlled` entry need
 * not be a real section, since clearing one with no URL state changes
 * nothing. `key` is carried in the effect's type, so it's checked against
 * the schema; a typo there is a compile error, not an effect that silently
 * does nothing.
 *
 * @typeParam K The discriminating key, kept at its literal type.
 * @param key The key whose change triggers the effect.
 * @param controlled The section prefixes the key controls.
 * @returns The effect, with `requires` naming the key.
 */
export const discriminatorEffect = <K extends string>(
  key: K,
  controlled: readonly string[],
): SuperhrefEffect<K> => {
  const eff: SuperhrefEffect<K> = (next, touched) => {
    if (!touched.includes(key)) return;
    const val = next.get(key);
    clearPrefixes(
      next,
      controlled.filter((p) => p !== val),
    );
  };
  eff.requires = [key];
  return eff;
};

const clearPrefixes = (
  params: URLSearchParams,
  prefixes: readonly string[],
): void => {
  const prefixSet = new Set(prefixes);
  for (const key of [...params.keys()]) {
    if (prefixSet.has(sectionPrefix(key))) params.delete(key);
  }
};
