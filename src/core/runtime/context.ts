import type { ActionMap } from "../types/bound.js";
import type {
  SuperhrefConfig,
  SuperhrefParsed,
  SuperhrefPatch,
} from "../types/config.js";
import type { SuperhrefEffect } from "../types/effect.js";
import type { Empty } from "../types/util.js";

export type AnyFunction = (...args: any[]) => any;

/**
 * The runtime context every operation reads from — pure data, no state. Carries the config
 * `C` and the top-level action map `A`. Both are needed to produce a precisely-typed bound
 * object; operations that don't use the actions can leave `A` at its `Empty` default.
 */
export interface Ctx<
  C extends SuperhrefConfig = SuperhrefConfig,
  A extends ActionMap<SuperhrefPatch<C>, SuperhrefParsed<C>> = Empty,
> {
  config: C;
  effects: SuperhrefEffect[];
  actions: A;
}
