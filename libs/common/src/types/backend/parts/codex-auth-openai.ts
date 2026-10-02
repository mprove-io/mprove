import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type CodexAuthOpenai = {
  type: 'oauth';
  refresh: string;
  expires: number;
  access?: string;
  accountId?: string;
};

export let zCodexAuthOpenai = z
  .object({
    type: z.literal('oauth'),
    refresh: z.string(),
    expires: z.number(),
    access: z.string().nullish(),
    accountId: z.string().nullish()
  })
  .meta({ id: 'CodexAuthOpenai' });

assertTypesEqual<CodexAuthOpenai, z.infer<typeof zCodexAuthOpenai>>({
  value: true
});
