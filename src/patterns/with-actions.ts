/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Codecs, Parsed } from "../core/types/codec.js";
import type { Section, SectionActionMap } from "../core/types/section.js";
import type {
  SectionActionCollisions,
  ValidateCodecs,
} from "../core/types/validate/section.js";

/**
 * Builds a section that has actions. Passing the codecs and actions as two
 * separate arguments lets each action's `patch` and `state` be typed from
 * the codecs automatically, with no annotation needed.
 *
 * @typeParam S The section's codecs map.
 * @typeParam A The action map, inferred from `actions`.
 * @param codecs The section's codecs. The `ValidateCodecs<S>` intersection
 * flags a bad or reserved codec key at the key itself.
 * @param actions The section's actions. `A` is inferred from this argument,
 * and its `SectionActionMap<Parsed<S>>` constraint gives each action's
 * `patch` and `state` their types with no annotation needed, while the
 * `SectionActionCollisions<S>` intersection rejects an action whose name
 * collides with a codec key or the reserved `patch` and `set`.
 * @returns The `{ codecs, actions }` section value.
 * @example
 *   const range = withActions(
 *     { start: dateIsoCodec(), end: dateIsoCodec() },
 *     {
 *       setRange: (patch, _s, from: Date, to: Date) => patch({ start: from, end: to }),
 *       clearRange: (patch) => patch({ start: null, end: null }),
 *     },
 *   ); // bound: setRange(from: Date, to: Date), clearRange()
 */
export function withActions<
  S extends Codecs,
  A extends SectionActionMap<Parsed<S>>,
>(
  codecs: S & ValidateCodecs<S>,
  actions: A & SectionActionCollisions<S>,
): Section<S, A> {
  return { codecs, actions };
}
