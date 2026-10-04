import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const chatMessageRoleValues = [
  'user',
  'agent',
  'tool',
  'thought',
  'error',
  'compaction',
  'interrupted'
] as const;

export type ChatMessageRole = (typeof chatMessageRoleValues)[number];

export let zChatMessageRole = z.enum(chatMessageRoleValues);

assertTypesEqual<ChatMessageRole, z.infer<typeof zChatMessageRole>>({
  value: true
});
