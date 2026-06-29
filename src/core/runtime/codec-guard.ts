import type { AnyCodec, Codecs } from "../types/codec.js";
import type { AnyFunction } from "./context.js";

/**
 * Is this config value a codec (rather than a section)? Codecs have `parse`/`serialize`;
 * sections don't.
 */
export const isCodec = (v: any): v is AnyCodec =>
  !!v && typeof v.parse === "function" && typeof v.serialize === "function";

/**
 * Split a section value into its codecs and actions. A section is either a bare codecs map
 * (`{ id: codec }`, no actions) or `{ codecs, actions }` — a `.codecs` property means the
 * latter; otherwise the value itself is the codecs map.
 */
export const sectionOf = (
  value: object,
): { codecs: Codecs; actions: Record<string, AnyFunction> } => {
  const v = value as { codecs?: Codecs; actions?: Record<string, AnyFunction> };
  return { codecs: v.codecs ?? (value as Codecs), actions: v.actions ?? {} };
};
