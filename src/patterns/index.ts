/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

// `withActions` builds a `{ codecs, actions }` section with full inference — the only
// way to attach actions to a section (actionless sections are bare codecs maps).
export { withActions } from "./with-actions.js";
