import { sectionPrefix } from "../core/runtime/keys.js";
import type { SuperhrefEffect } from "../core/types/effect.js";

/**
 * When `key` is touched, clear every `controlled` prefix except the one matching the new
 * value — e.g. switching a `panel` key clears the URL state of the panels you switched
 * away from. A `controlled` entry need not be a real section (clearing one with no URL
 * state is a no-op). `key` is carried in the effect's type, so it's checked against the
 * config — a typo there is a compile error, not an effect that silently does nothing.
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
  for (const key of [...params.keys()]) {
    if (prefixes.includes(sectionPrefix(key))) params.delete(key);
  }
};
