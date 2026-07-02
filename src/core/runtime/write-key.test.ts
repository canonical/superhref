/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import { describe, expect, it } from "vitest";

import { numCodec, strCodec } from "../../codecs/index.js";
import type { AnyCodec } from "../types/codec.js";
import { writeKey } from "./write-key.js";

// Apply writeKey to fresh params (seeded with `start`) and read back the search string.
const write = (codec: AnyCodec, value: unknown, start = ""): string => {
  const params = new URLSearchParams(start);
  writeKey(params, "k", codec, value);
  const s = params.toString();
  return s ? `?${s}` : "";
};

describe("writeKey", () => {
  it("null deletes the key", () => {
    expect(write(strCodec(), null, "k=hi")).toBe("");
  });

  it("a plain value writes it", () => {
    expect(write(strCodec(), "hi")).toBe("?k=hi");
  });

  it("undefined leaves the key unchanged", () => {
    expect(write(strCodec(), undefined, "k=hi")).toBe("?k=hi"); // present → stays
    expect(write(strCodec(), undefined, "")).toBe(""); //         absent  → stays absent
  });

  it("undefined does NOT reset to the default — it's a no-op even for a defaulted codec", () => {
    expect(write(numCodec({ default: 5 }), undefined, "k=2")).toBe("?k=2"); // unchanged, not 5
  });

  it("writes a value verbatim, even when it equals the default", () => {
    expect(write(numCodec({ default: 1 }), 1, "k=2")).toBe("?k=1");
  });

  it("a serialize returning null deletes", () => {
    expect(write(strCodec(), "", "k=hi")).toBe(""); // strCodec("") with no default → null
  });
});
