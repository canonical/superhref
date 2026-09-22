/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Zod integration for adapting synchronous schemas to URL parameter codecs.
 * @module codecs
 */

export type {
  ZodCodecOptions,
  ZodCompatibleSchema,
  ZodSafeParseResult,
} from "./zod.js";
export { zodCodec } from "./zod.js";
