/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { isCodec, sectionOf } from "./codec-guard.js";
import type { Ctx } from "./context.js";
import { innerKey } from "./keys.js";

/** Remove every owned key (all roots + all section keys). Runs no effects. */
export const clear = (ctx: Ctx, url: URL): URL => {
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
};
