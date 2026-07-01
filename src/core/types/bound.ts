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

import type { AnyCodec, Codecs, CodecValue } from "./codec.js";
import type {
  ActionsOf,
  CodecsOf,
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
} from "./config.js";
import type { Pretty, UnionToIntersection } from "./util.js";

/** A map of named top-level actions, each `(patch, state, ...args) => string`. */
export type ActionMap<P, S> = Record<
  string,
  // biome-ignore lint/suspicious/noExplicitAny: variadic action args are intentionally open-ended
  (patch: P, state: S, ...args: any[]) => string
>;

/**
 * Strip the leading `(patch, state)` params — what remains is the bound method.
 * @example `ResolvedAction<(patch, state, id: string) => string>` → `(id: string) => string`
 */
export type ResolvedAction<F> = F extends (
  patch: infer _P,
  state: infer _S,
  ...args: infer A
) => infer R
  ? (...args: A) => R
  : never;

export type ResolvedActions<A> = { [K in keyof A]: ResolvedAction<A[K]> };

type Values<S extends Codecs> = { [K in keyof S]: CodecValue<S[K]> };

/**
 * A section handle: its parsed values (under their raw keys), its bound actions, and a
 * `patch`/`set` pair. `null` deletes a key (on both); `undefined` or an absent key is a
 * no-op.
 * @example `set("page", 2)` ✓ — `set("page", null)` deletes — `set("page", "2")` ✗
 */
export type SectionHandle<V> = Pretty<
  Values<CodecsOf<V>> &
    ResolvedActions<ActionsOf<V>> & {
      patch: (
        partial: {
          [K in keyof CodecsOf<V>]?: CodecValue<CodecsOf<V>[K]> | null;
        },
      ) => string;
      // One call signature per codec key, pairing each key with its own value type.
      set: UnionToIntersection<
        {
          [K in keyof CodecsOf<V> & string]: (
            key: K,
            value: CodecValue<CodecsOf<V>[K]> | null,
          ) => string;
        }[keyof CodecsOf<V> & string]
      >;
    }
>;

type RootKeys<C extends SuperhrefConfig> = {
  [K in keyof C]: C[K] extends AnyCodec ? K : never;
}[keyof C];
// A section key is any key whose value is not a root codec.
type SectionKeys<C extends SuperhrefConfig> = {
  [K in keyof C]: C[K] extends AnyCodec ? never : K;
}[keyof C];

export type RootValues<C extends SuperhrefConfig> = {
  [K in RootKeys<C>]: CodecValue<C[K]>;
};
export type PerSectionHandles<C extends SuperhrefConfig> = {
  [K in SectionKeys<C>]: SectionHandle<C[K]>;
};

/**
 * The object `bind(url)` returns: the root values, a handle per section, the bound
 * top-level actions, and `patch`/`clear`/`set`.
 */
export type BoundSuperhref<
  C extends SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>>,
> = Pretty<
  RootValues<C> &
    PerSectionHandles<C> &
    ResolvedActions<A> & {
      patch: (partial: SuperhrefPatchInput<C>) => string;
      clear: () => string;
      set: UnionToIntersection<
        {
          [K in RootKeys<C> & string]: (
            key: K,
            value: CodecValue<C[K]> | null,
          ) => string;
        }[RootKeys<C> & string]
      >;
    }
>;

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
