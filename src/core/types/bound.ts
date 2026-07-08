/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * The bound object model: the shape `bind(url)` returns. Root values, one
 * handle per section, actions with their leading parameters resolved, and
 * the typed `patch`, `clear`, and `set` methods.
 */

import type { AnyCodec, Codecs, CodecValue } from "./codec.js";
import type {
  ActionsOf,
  CodecsOf,
  ConfigValue,
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
} from "./config.js";
import type { Action } from "./section.js";
import type { Pretty, UnionToIntersection } from "./util.js";

/** A map of named top level actions, each `(patch, state, ...args) => string`. */
export type ActionMap<P, S> = Record<string, Action<P, S>>;

/**
 * Strips the leading `patch` and `state` parameters; what remains is the
 * bound method.
 * @example `ResolvedAction<(patch, state, id: string) => string>` resolves to `(id: string) => string`.
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
 * `patch`/`set` pair.
 */
export type SectionHandle<V extends ConfigValue> = Pretty<
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
          [K in keyof CodecsOf<V>]: (
            key: K,
            value: CodecValue<CodecsOf<V>[K]> | null,
          ) => string;
        }[keyof CodecsOf<V>]
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
 * The object `bind(url)` returns: the root values, a handle per section, the
 * bound top level actions, and `patch`/`clear`/`set`.
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
          [K in RootKeys<C>]: (
            key: K,
            value: CodecValue<C[K]> | null,
          ) => string;
        }[RootKeys<C>]
      >;
    }
>;
