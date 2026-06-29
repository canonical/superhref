import type { SuperhrefConfig, SuperhrefPatchInput } from "../types/config.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import type { Ctx } from "./context.js";
import { innerKey } from "./keys.js";
import { writeKey } from "./write-key.js";

/**
 * Apply a nested partial update and return a new URL.
 * Writes the named keys, records the `touched` set, then
 * runs effects once. A leaf `null` deletes a key; `undefined`
 * (or an absent key) leaves it unchanged.
 * A section set to `null` clears every key under its prefix;
 * `undefined`/absence leaves the section unchanged.
 * Keys the config doesn't own are never touched.
 */
export const patch = <C extends SuperhrefConfig>(
  ctx: Ctx<C>,
  url: URL,
  partial: SuperhrefPatchInput<C>,
): URL => {
  const next = new URL(url.href);
  const params = next.searchParams;
  const touched: string[] = [];

  for (const [key, val] of Object.entries(partial)) {
    if (val === undefined) continue;

    const field = ctx.config[key];

    if (!field) continue;

    if (isCodec(field)) {
      touched.push(key);
      writeKey(params, key, field, val);
    } else {
      const { codecs } = sectionOf(field);
      if (val === null) {
        for (const ck of Object.keys(codecs)) {
          const full = innerKey(key, ck);
          touched.push(full);
          params.delete(full);
        }
      } else {
        for (const [ck, cval] of Object.entries(val)) {
          if (cval === undefined) continue;

          const codec = codecs[ck];
          if (!codec) continue;

          const full = innerKey(key, ck);
          touched.push(full);
          writeKey(params, full, codec, cval);
        }
      }
    }
  }

  for (const eff of ctx.effects) eff(params, touched);
  return next;
};
