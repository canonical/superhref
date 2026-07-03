/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

/**
 * Patterns for building config values. `withActions` builds a
 * `{ codecs, actions }` section with full inference; it is the only way to
 * attach actions to a section, since an actionless section is a bare codecs
 * map.
 * @module patterns
 */
export { withActions } from "./with-actions.js";
