/*
 * Copyright 2026 Canonical Ltd.  This software is licensed under the
 * GNU Lesser General Public License version 3 (see the file LICENSE).
 */

import type { ConfigValue } from "../types/config.js";
import type { Ctx } from "../types/context.js";
import { isCodec } from "./codec-guard.js";
import { KEY_SEP } from "./keys.js";

export const RESERVED_ROOT_NAMES = ["patch", "clear", "set"] as const;
export const RESERVED_CODEC_KEYS = [
  "patch",
  "set",
  "codecs",
  "actions",
] as const;
export const RESERVED_ACTION_NAMES = ["patch", "set"] as const;

const KEY_SYNTAX = /^[A-Za-z][A-Za-z0-9_~-]*$/;
const reservedRootNames: ReadonlySet<string> = new Set(RESERVED_ROOT_NAMES);
const reservedCodecKeys: ReadonlySet<string> = new Set(RESERVED_CODEC_KEYS);
const reservedActionNames: ReadonlySet<string> = new Set(RESERVED_ACTION_NAMES);

const reservedRootNamesStr = RESERVED_ROOT_NAMES.join("/");
const reservedCodecKeysStr = RESERVED_CODEC_KEYS.join("/");
const reservedActionNamesStr = RESERVED_ACTION_NAMES.join("/");

const validated = new WeakSet<object>();

export function assertValidSchema(ctx: Ctx): void {
  if (validated.has(ctx)) return;

  const problems: string[] = [];

  if (!isRecord(ctx.schema))
    problems.push("superhref: schema must be an object");
  if (!isRecord(ctx.actions))
    problems.push("superhref: actions must be an object");
  if (problems.length > 0) throw new TypeError(problems.join("\n"));

  const schemaKeys = new Set(Object.keys(ctx.schema));

  for (const [key, value] of Object.entries(ctx.schema)) {
    if (!KEY_SYNTAX.test(key))
      problems.push(
        `superhref: schema key "${key}" is not a valid URL key (letters/digits/_~- only, must start with a letter; "${KEY_SEP}" is reserved)`,
      );
    if (reservedRootNames.has(key))
      problems.push(
        `superhref: schema key "${key}" is reserved (${reservedRootNamesStr})`,
      );
    if (!isRecord(value))
      problems.push(
        `superhref: schema value "${key}" is neither a codec nor a section`,
      );
    else if (!isCodec(value))
      problems.push(...collectSectionProblems(key, value));
  }

  const actions = ctx.actions as Record<string, unknown>;

  for (const [name, value] of Object.entries(actions)) {
    if (reservedRootNames.has(name))
      problems.push(
        `superhref: action "${name}" is reserved (${reservedRootNamesStr})`,
      );
    if (schemaKeys.has(name))
      problems.push(
        `superhref: action "${name}" collides with the schema key "${name}"`,
      );
    if (typeof value !== "function")
      problems.push(`superhref: action "${name}" is not a function`);
  }

  if (problems.length > 0) throw new TypeError(problems.join("\n"));
  validated.add(ctx);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function collectSectionProblems(
  sectionKey: string,
  section: Record<string, unknown>,
): string[] {
  const codecs = section.codecs ?? null;
  if (codecs === null) return collectCodecMapProblems(sectionKey, section);

  const problems: string[] = [];
  for (const key of Object.keys(section))
    if (key !== "codecs" && key !== "actions")
      problems.push(
        `superhref: section "${sectionKey}" has an unknown key "${key}" (a section is a codecs map or { codecs, actions })`,
      );

  if (!isRecord(codecs) || isCodec(codecs as ConfigValue))
    problems.push(
      `superhref: section "${sectionKey}" has a "codecs" value that is not a codecs map`,
    );
  else problems.push(...collectCodecMapProblems(sectionKey, codecs));

  const actions = section.actions ?? {};
  if (!isRecord(actions) || isCodec(actions as ConfigValue))
    problems.push(
      `superhref: section "${sectionKey}" has an "actions" value that is not an action map`,
    );
  else {
    const codecKeys = new Set(isRecord(codecs) ? Object.keys(codecs) : []);
    problems.push(...collectActionMapProblems(sectionKey, actions, codecKeys));
  }
  return problems;
}

function collectCodecMapProblems(
  sectionKey: string,
  codecs: Record<string, unknown>,
): string[] {
  const problems: string[] = [];
  for (const [key, value] of Object.entries(codecs)) {
    if (!KEY_SYNTAX.test(key))
      problems.push(
        `superhref: section "${sectionKey}" has an invalid codec key "${key}"`,
      );
    if (reservedCodecKeys.has(key))
      problems.push(
        `superhref: section "${sectionKey}" has a reserved codec key "${key}" (${reservedCodecKeysStr})`,
      );
    if (!isRecord(value) || !isCodec(value as ConfigValue))
      problems.push(
        `superhref: section "${sectionKey}" has a codec key "${key}" whose value is not a codec`,
      );
  }
  return problems;
}

function collectActionMapProblems(
  sectionKey: string,
  actions: Record<string, unknown>,
  codecKeys: ReadonlySet<string>,
): string[] {
  const problems: string[] = [];
  for (const [name, value] of Object.entries(actions)) {
    if (reservedActionNames.has(name))
      problems.push(
        `superhref: section "${sectionKey}" has an action named "${name}" (${reservedActionNamesStr} are reserved)`,
      );
    if (codecKeys.has(name))
      problems.push(
        `superhref: section "${sectionKey}" has a codec key and an action named "${name}"`,
      );
    if (typeof value !== "function")
      problems.push(
        `superhref: section "${sectionKey}" has an action "${name}" that is not a function`,
      );
  }
  return problems;
}
