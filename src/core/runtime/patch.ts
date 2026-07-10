/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { SuperhrefConfig, SuperhrefPatchInput } from "../types/config.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import type { Ctx } from "./context.js";
import { innerKey } from "./keys.js";
import { writeKey } from "./write-key.js";

/**
 * Applies a nested partial update and returns a new URL.
 *
 * A leaf `null` deletes a key; `undefined` or an absent key leaves it
 * unchanged. A section set to `null` clears every key the section owns,
 * while `undefined` or absence leaves the section unchanged. Keys the
 * config doesn't own are never touched.
 *
 * @typeParam C The config shape the payload is checked against.
 * @param ctx The runtime context carrying the config.
 * @param url The URL to derive from; it is not modified.
 * @param partial The nested partial update.
 * @returns A new URL with the update applied.
 */
export function patch<C extends SuperhrefConfig>(
  ctx: Ctx<C>,
  url: URL,
  partial: SuperhrefPatchInput<C>,
): URL {
  const next = new URL(url.href);
  const params = next.searchParams;

  for (const [key, val] of Object.entries(partial)) {
    if (val === undefined) continue;

    const field = ctx.config[key];

    if (!field) continue;

    if (isCodec(field)) {
      writeKey(params, key, field, val);
    } else {
      const { codecs } = sectionOf(field);
      if (val === null) {
        for (const ck of Object.keys(codecs)) {
          params.delete(innerKey(key, ck));
        }
      } else {
        for (const [ck, cval] of Object.entries(val)) {
          if (cval === undefined) continue;

          const codec = codecs[ck];
          if (!codec) continue;

          writeKey(params, innerKey(key, ck), codec, cval);
        }
      }
    }
  }

  return next;
}
