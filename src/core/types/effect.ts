/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * A function run after a patch has written its keys, mutating the in-progress URL's
 * `URLSearchParams` directly. `touched` is the set of full dotted key names the patch
 * named — whether or not a value actually changed (re-submitting the same value still
 * counts as touched).
 *
 * Effects run in array order, once per patch, and do not cascade: an effect's own writes
 * never re-trigger other effects, and never extend `touched`.
 *
 * `Req` is the set of keys (a root key, or a dotted `section.codec`) the effect depends
 * on, surfaced at runtime as `requires`. Naming them in the type lets them be checked
 * against the available keys, turning a typo into a compile error rather than an effect
 * that silently never runs.
 */
export type SuperhrefEffect<Req extends string = string> = ((
  next: URLSearchParams,
  touched: ReadonlyArray<string>,
) => void) & { requires?: readonly Req[] };
