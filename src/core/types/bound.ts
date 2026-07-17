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
  SuperhrefParsed,
  SuperhrefPatch,
  SuperhrefPatchInput,
  SuperhrefSchema,
} from "./schema.js";
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

type RootKeys<S extends SuperhrefSchema> = {
  [K in keyof S]: S[K] extends AnyCodec ? K : never;
}[keyof S];
// A section key is any key whose value is not a root codec.
type SectionKeys<S extends SuperhrefSchema> = {
  [K in keyof S]: S[K] extends AnyCodec ? never : K;
}[keyof S];

export type RootValues<S extends SuperhrefSchema> = {
  [K in RootKeys<S>]: CodecValue<S[K]>;
};
export type PerSectionHandles<S extends SuperhrefSchema> = {
  [K in SectionKeys<S>]: SectionHandle<S[K]>;
};

/**
 * The object `bind(url)` returns: the root values, a handle per section, the
 * bound top level actions, and `patch`/`clear`/`set`.
 */
export type BoundSuperhref<
  S extends SuperhrefSchema,
  A extends ActionMap<SuperhrefPatch<S>, SuperhrefParsed<S>>,
> = Pretty<
  RootValues<S> &
    PerSectionHandles<S> &
    ResolvedActions<A> & {
      patch: (partial: SuperhrefPatchInput<S>) => string;
      clear: () => string;
      set: UnionToIntersection<
        {
          [K in RootKeys<S>]: (
            key: K,
            value: CodecValue<S[K]> | null,
          ) => string;
        }[RootKeys<S>]
      >;
    }
>;
