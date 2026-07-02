/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { SuperhrefConfig, SuperhrefParsed } from "../types/config.js";
import { isCodec, sectionOf } from "./codec-guard.js";
import type { Ctx } from "./context.js";
import { innerKey } from "./keys.js";

/**
 * Read a URL into nested state (one value per root key, one sub-object per section).
 * Keyed by the RAW URL key — `URLSearchParams.get` percent-decodes, so codecs
 * receive plain values. The result shape is derived from the config `C`.
 */
export const parse = <C extends SuperhrefConfig>(
  ctx: Ctx<C>,
  url: URL,
): SuperhrefParsed<C> => {
  const params = url.searchParams;
  const queryParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(ctx.config)) {
    if (isCodec(value)) {
      queryParams[key] = value.parse(params.get(key));
    } else {
      const section: Record<string, unknown> = {};
      for (const [subkey, codec] of Object.entries(sectionOf(value).codecs)) {
        section[subkey] = codec.parse(params.get(innerKey(key, subkey)));
      }
      queryParams[key] = section;
    }
  }

  return queryParams as unknown as SuperhrefParsed<C>;
};
