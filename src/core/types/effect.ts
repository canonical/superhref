/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * A function run after a patch has written its keys, mutating the new URL's
 * `URLSearchParams` in place. Effects run in array order, once per patch,
 * and do not cascade: an effect's own writes never trigger other effects and
 * never extend `touched`.
 *
 * @typeParam Req The keys this effect depends on: a root key or a dotted
 * `section.codec`. Surfaced at runtime as `requires`; naming them in the
 * type checks them against the config's keys, so a typo is a compile error
 * rather than an effect that silently never runs.
 * @param next The patched `URLSearchParams`, mutated in place.
 * @param touched The full dotted key names the patch named, whether or not
 * a value actually changed (submitting the same value again still counts).
 * Independent of `Req`: `requires` is what the effect depends on, while
 * `touched` is every key the patch wrote.
 */
export type SuperhrefEffect<Req extends string = string> = ((
  next: URLSearchParams,
  touched: ReadonlyArray<string>,
) => void) & { requires?: readonly Req[] };
