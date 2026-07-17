/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Compile time validators for a section: key syntax, reserved names, and
 * collisions between codec keys and action names. Each validator turns a
 * problem into an error string type at the offending key, so the compiler
 * reports it exactly where the fix belongs.
 */

import type {
  RESERVED_ACTION_NAMES,
  RESERVED_CODEC_KEYS,
} from "../../runtime/schema-guard.js";
import type { Codecs } from "../codec.js";
import type {
  ActionsOf,
  CodecsOf,
  ConfigValue,
  SuperhrefSchema,
} from "../schema.js";
import type { InvalidKeyMsg, ValidKey } from "./key.js";

/** `true` unless `T` is `never`. (Wrapping in a tuple stops union distribution.) */
type NotNever<T> = [T] extends [never] ? false : true;

export type ReservedCodecKey = (typeof RESERVED_CODEC_KEYS)[number];
export type ReservedActionName = (typeof RESERVED_ACTION_NAMES)[number];

/**
 * Maps every codec key in `S` and the reserved handle methods (`patch`/`set`) to an
 * error string type, all optional. Used as a constraint on a section's action map: an
 * action whose name collides with a codec key or a handle method would have to BE that
 * string, and a function is not a string, so the clash becomes a compile error at
 * that action.
 */
export type SectionActionCollisions<S extends Codecs> = {
  [N in
    | (keyof S & string)
    | ReservedActionName]?: `superhref: section action "${N}" collides with a codec key or the reserved .${N}`;
};

/**
 * Checks each key of a codecs map. A key with invalid syntax or a reserved name
 * (`patch`/`set`/`codecs`/`actions`) has its value replaced by an error string; a valid
 * key keeps its codec. Since a codec can't BE that string, a bad codec key fails to
 * compile at that key, while the other keys keep their precise types.
 */
export type ValidateCodecs<S extends Codecs> = {
  [K in keyof S]: ValidKey<K & string> extends true
    ? K extends ReservedCodecKey
      ? `superhref: codec key "${K & string}" is reserved (patch/set/codecs/actions)`
      : S[K]
    : InvalidKeyMsg<"codec", K & string>;
};

type CodecKeys<V extends ConfigValue> = keyof CodecsOf<V> & string;
type ActionNames<V extends ConfigValue> = keyof ActionsOf<V> & string;
type BadCodecKeys<V extends ConfigValue> = {
  [CK in CodecKeys<V>]: ValidKey<CK> extends true ? never : CK;
}[CodecKeys<V>];

/**
 * `true` if a section has any naming problem: a codec key with invalid syntax, a reserved
 * codec key, a reserved action name, or a codec key and an action name that collide (both
 * would become members of the same handle).
 */
export type SectionHasProblem<V extends ConfigValue> = true extends
  | NotNever<CodecKeys<V> & ActionNames<V>> //        codec key × action name
  | NotNever<CodecKeys<V> & ReservedCodecKey> //      reserved codec key
  | NotNever<ActionNames<V> & ReservedActionName> //  reserved action name
  | NotNever<BadCodecKeys<V>> //                      codec key syntax
  ? true
  : false;

/** The first matching message for a flagged section (only evaluated for bad sections). */
export type SectionMsg<S extends SuperhrefSchema, K extends keyof S> = [
  BadCodecKeys<S[K]>,
] extends [never]
  ? [CodecKeys<S[K]> & ActionNames<S[K]>] extends [never]
    ? [CodecKeys<S[K]> & ReservedCodecKey] extends [never]
      ? [ActionNames<S[K]> & ReservedActionName] extends [never]
        ? never
        : `superhref: section "${K & string}" has an action named "${ActionNames<S[K]> & ReservedActionName}" (patch/set are reserved)`
      : `superhref: section "${K & string}" has a reserved codec key "${CodecKeys<S[K]> & ReservedCodecKey}" (patch/set/codecs/actions)`
    : `superhref: section "${K & string}" has a codec key and an action named "${CodecKeys<S[K]> & ActionNames<S[K]>}"`
  : `superhref: section "${K & string}" has an invalid codec key "${BadCodecKeys<S[K]>}"`;
