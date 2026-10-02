import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CodexAuthOpenai,
  zCodexAuthOpenai
} from '#common/types/backend/parts/codex-auth-openai';

export type CodexAuth = {
  openai: CodexAuthOpenai;
};

export let zCodexAuth = z
  .object({
    openai: zCodexAuthOpenai
  })
  .meta({ id: 'CodexAuth' });

assertTypesEqual<CodexAuth, z.infer<typeof zCodexAuth>>({ value: true });
