/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Flatten an intersection for readable hovers/errors.
 * @example `Pretty<{ a: 1 } & { b: 2 }>` → `{ a: 1; b: 2 }`
 */
export type Pretty<T> = { [K in keyof T]: T[K] } & {};

/**
 * An object type with no keys — used as a "nothing here" default. Equivalent to `{}`
 * but avoids the `noBannedTypes` lint that bare `{}` triggers.
 */
export type Empty = Record<never, never>;

/**
 * Collapse a union into the intersection of its members (the classic contravariance
 * trick: put `U` in a parameter position, then `infer` it back out).
 * @example `UnionToIntersection<{ a: 1 } | { b: 2 }>` → `{ a: 1 } & { b: 2 }`
 *
 * Intersecting a union of single-argument call signatures turns them into an overload
 * set — which is how a key→value setter type can list one signature per key.
 */
export type UnionToIntersection<U> = (
  U extends unknown
    ? (x: U) => void
    : never
) extends (x: infer I) => void
  ? I
  : never;
