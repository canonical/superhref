/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ActionMap, BoundSuperhref } from "./bound.js";
import type {
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
  SuperhrefSchema,
} from "./schema.js";

/** The instance returned by `superhref(...)`. */
export interface Superhref<
  S extends SuperhrefSchema,
  A extends ActionMap<SuperhrefPatch<S>, SuperhrefParsed<S>>,
> {
  parse(url: URL): SuperhrefParsed<S>;
  patch(url: URL, partial: SuperhrefPatchInput<S>): URL;
  clear(url: URL): URL;
  bind(url: URL): BoundSuperhref<S, A>;
}
