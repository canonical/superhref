/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { Ctx } from "../types/context.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import { innerKey } from "./keys.js";

/**
 * Removes every owned key: all roots and all section keys.
 *
 * @param ctx The runtime context carrying the config.
 * @param url The URL to derive from; it is not modified.
 * @returns A new URL without any owned keys.
 */
export function clear(ctx: Ctx, url: URL): URL {
  const next = new URL(url.href);
  const params = next.searchParams;

  for (const [key, value] of Object.entries(ctx.config)) {
    if (isCodec(value)) {
      params.delete(key);
    } else {
      for (const subkey of Object.keys(sectionOf(value).codecs)) {
        params.delete(innerKey(key, subkey));
      }
    }
  }
  return next;
}
