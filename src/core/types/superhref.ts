/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ActionMap, BoundSuperhref } from "./bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
} from "./config.js";

/** The instance returned by `superhref(...)`. */
export interface Superhref<
  C extends SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>>,
> {
  parse(url: URL): SuperhrefParsed<C>;
  patch(url: URL, partial: SuperhrefPatchInput<C>): URL;
  clear(url: URL): URL;
  bind(url: URL): BoundSuperhref<C, A>;
}
