import type { Part } from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type SessionPartApi = {
  partId: string;
  messageId: string;
  sessionId: string;
  ocPart: Part;
};

export let zSessionPartApi = z
  .object({
    partId: z.string(),
    messageId: z.string(),
    sessionId: z.string(),
    ocPart: z.custom<Part>()
  })
  .meta({ id: 'SessionPartApi' });

assertTypesEqual<SessionPartApi, z.infer<typeof zSessionPartApi>>({
  value: true
});
