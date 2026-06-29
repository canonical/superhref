import type { ActionsOf, CodecsOf } from "../config.js";
import type { ValidKey } from "../key.js";

/** `true` unless `T` is `never`. (Wrapping in a tuple stops union distribution.) */
type NotNever<T> = [T] extends [never] ? false : true;

export type ReservedCodecKey = "patch" | "set" | "codecs" | "actions";
export type ReservedActionName = "patch" | "set";

/**
 * Maps every codec key in `S` and the reserved handle methods (`patch`/`set`) to an
 * error-string type, all optional. Used as a constraint on a section's action map: an
 * action whose name collides with a codec key or a handle method would have to BE that
 * string, and a function isn't — so it's a compile error at that action.
 */
export type SectionActionCollisions<S> = {
  [N in
    | (keyof S & string)
    | ReservedActionName]?: `superhref: section action "${N}" collides with a codec key or the reserved .${N}`;
};

/**
 * Checks each key of a codecs map. A key with invalid syntax or a reserved name
 * (`patch`/`set`/`codecs`/`actions`) has its value replaced by an error string; a valid
 * key keeps its codec. Since a codec can't BE that string, a bad codec key fails to
 * type-check at that key, while the other keys keep their precise types.
 */
export type ValidateCodecs<S> = {
  [K in keyof S]: ValidKey<K & string> extends true
    ? K extends ReservedCodecKey
      ? `superhref: codec key "${K & string}" is reserved (patch/set/codecs/actions)`
      : S[K]
    : `superhref: codec key "${K & string}" is not a valid URL key (letters/digits/_~- only, must start with a letter; "." is reserved)`;
};

type CodecKeys<V> = keyof CodecsOf<V> & string;
type ActionNames<V> = keyof ActionsOf<V> & string;
type BadCodecKeys<V> = {
  [CK in CodecKeys<V>]: ValidKey<CK> extends true ? never : CK;
}[CodecKeys<V>];

/**
 * `true` if a section has any naming problem: a codec key with invalid syntax, a reserved
 * codec key, a reserved action name, or a codec key and an action name that collide (both
 * would become members of the same handle).
 */
export type SectionHasProblem<V> = true extends
  | NotNever<CodecKeys<V> & ActionNames<V>> //        codec key × action name
  | NotNever<CodecKeys<V> & ReservedCodecKey> //      reserved codec key
  | NotNever<ActionNames<V> & ReservedActionName> //  reserved action name
  | NotNever<BadCodecKeys<V>> //                      codec key syntax
  ? true
  : false;

/** First-matching message for a flagged section (only evaluated for bad sections). */
export type SectionMsg<C, K extends keyof C> = [BadCodecKeys<C[K]>] extends [
  never,
]
  ? [CodecKeys<C[K]> & ActionNames<C[K]>] extends [never]
    ? [CodecKeys<C[K]> & ReservedCodecKey] extends [never]
      ? [ActionNames<C[K]> & ReservedActionName] extends [never]
        ? never
        : `superhref: section "${K & string}" has an action named "${ActionNames<C[K]> & ReservedActionName}" (patch/set are reserved)`
      : `superhref: section "${K & string}" has a reserved codec key "${CodecKeys<C[K]> & ReservedCodecKey}" (patch/set/codecs/actions)`
    : `superhref: section "${K & string}" has a codec key and an action named "${CodecKeys<C[K]> & ActionNames<C[K]>}"`
  : `superhref: section "${K & string}" has an invalid codec key "${BadCodecKeys<C[K]>}"`;
