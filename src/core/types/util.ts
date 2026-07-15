/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Generic type utilities the rest of the type model shares.
 */

/**
 * Flattens an intersection for readable hovers and errors.
 * @example `Pretty<{ a: 1 } & { b: 2 }>` resolves to `{ a: 1; b: 2 }`.
 */
export type Pretty<T> = { [K in keyof T]: T[K] } & {};

/**
 * An object type with no keys, used as a "nothing here" default. Equivalent to `{}`
 * but avoids the `noBannedTypes` lint that bare `{}` triggers.
 */
export type Empty = Record<never, never>;

/**
 * Collapses a union into the intersection of its members (the classic
 * contravariance trick: put `U` in a parameter position, then `infer` it
 * back out).
 * @example `UnionToIntersection<{ a: 1 } | { b: 2 }>` resolves to `{ a: 1 } & { b: 2 }`.
 *
 * Intersecting a union of single argument call signatures turns them into an
 * overload set, which is how a setter type can list one signature per key.
 */
export type UnionToIntersection<U> = (
  U extends unknown
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;

/** A function of any signature, for runtime code that dispatches by name. */
// biome-ignore lint/suspicious/noExplicitAny: generic function alias for heterogeneous action signatures
export type AnyFunction = (...args: any[]) => any;
