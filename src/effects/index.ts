/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Effect helpers with zero dependencies. Effects run after every patch and
 * may touch any owned key.
 * @module effects
 */
export { discriminatorEffect } from "./discriminator.js";
