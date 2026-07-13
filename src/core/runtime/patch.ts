/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { AnyCodec } from "../types/codec.js";
import type { SuperhrefConfig, SuperhrefPatchInput } from "../types/config.js";
import type { Ctx } from "../types/context.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import { innerKey } from "./keys.js";

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

  for (const [key, valueToWrite] of Object.entries(partial)) {
    if (valueToWrite === undefined) continue;

    const configValue = ctx.config[key];

    if (!configValue) continue;

    if (isCodec(configValue)) {
      applyKey(params, key, configValue, valueToWrite);
    } else {
      const { codecs } = sectionOf(configValue);
      if (valueToWrite === null) {
        for (const [subKey, codec] of Object.entries(codecs)) {
          applyKey(params, innerKey(key, subKey), codec, null);
        }
      } else {
        for (const [subKey, subValue] of Object.entries(valueToWrite)) {
          if (subValue === undefined) continue;

          const codec = codecs[subKey];
          if (!codec) continue;

          applyKey(params, innerKey(key, subKey), codec, subValue);
        }
      }
    }
  }

  return next;
}

function applyKey(
  params: URLSearchParams,
  fullKey: string,
  codec: AnyCodec,
  value: unknown,
): void {
  if (value === undefined) return;
  if (value === null) {
    return params.delete(fullKey);
  }
  const s = codec.serialize(value);
  if (s === null) {
    return params.delete(fullKey);
  }
  params.set(fullKey, s);
}
