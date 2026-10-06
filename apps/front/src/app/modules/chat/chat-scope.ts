import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const chatScopeValues = ['builder', 'explorer'] as const;

export type ChatScope = (typeof chatScopeValues)[number];

export let zChatScope = z.enum(chatScopeValues);

assertTypesEqual<ChatScope, z.infer<typeof zChatScope>>({
  value: true
});
