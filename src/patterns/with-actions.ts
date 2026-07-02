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
 * Build a section that has actions. Passing the codecs and actions as two separate
 * arguments lets each action's `patch` and `state` be typed from the codecs
 * automatically — no annotation needed. This is the only way to attach actions to a
 * section; a section without actions is just a bare codecs map.
 *
 * @example
 *   const range = withActions(
 *     { start: dateIsoCodec(), end: dateIsoCodec() },
 *     {
 *       setRange: (patch, _s, from: Date, to: Date) => patch({ start: from, end: to }),
 *       clearRange: (patch) => patch({ start: null, end: null }),
 *     },
 *   ); // bound: setRange(from: Date, to: Date), clearRange()
 */
export const withActions = <
  S extends Codecs,
  A extends SectionActionMap<Parsed<S>>,
>(
  // `S &` pins `S` to the codecs; `& ValidateCodecs<S>` flags a bad or reserved codec key
  // at the key itself.
  codecs: S & ValidateCodecs<S>,
  // This intersection both infers `A` and gives each action's `patch`/`state` their types;
  // `SectionActionCollisions<S>` rejects an action whose name collides with a codec key or
  // the reserved `patch`/`set`.
  actions: A & SectionActionMap<Parsed<S>> & SectionActionCollisions<S>,
): Section<S, A> => ({ codecs, actions });
