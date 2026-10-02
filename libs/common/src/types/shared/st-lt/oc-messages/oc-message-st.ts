import type { Message } from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OcMessageSt = {
  ocMessage: Message;
};

export let zOcMessageSt = z
  .object({ ocMessage: z.custom<Message>() })
  .meta({ id: 'OcMessageSt' });

assertTypesEqual<OcMessageSt, z.infer<typeof zOcMessageSt>>({ value: true });
