/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Minimal type-level assertion helpers, in the type-challenges style. A `*.typestest.ts`
 * file uses these to assert relationships between types; a wrong assertion is a compile
 * error, so `tsc` (via `pnpm typetest`) is the test runner.
 */

/** Compiles only when `T` resolves to exactly `true`. */
export type ExpectTrue<T extends true> = T;

/** Compiles only when `T` resolves to exactly `false`. */
export type ExpectFalse<T extends false> = T;

/**
 * Strict, invariant type equality: distinguishes `any` / `unknown` / `never` and honours
 * readonly/optional modifiers (the classic deferred-conditional trick). It treats an
 * intersection like `A & {}` as distinct from `A`, so avoid it on `Pretty<>`-wrapped
 * shapes. Test those by assignability (`Extends`) or by usage instead.
 */
export type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

/** The negation of `Equal`. */
export type NotEqual<X, Y> = Equal<X, Y> extends true ? false : true;

/** `true` when `A` is assignable to `B` */
export type Extends<A, B> = A extends B ? true : false;
