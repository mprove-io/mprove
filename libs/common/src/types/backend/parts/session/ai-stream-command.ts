import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const aiStreamCommandValues = ['interact', 'stop', 'set-title'] as const;

export type AiStreamCommand = (typeof aiStreamCommandValues)[number];

export let zAiStreamCommand = z.enum(aiStreamCommandValues);

assertTypesEqual<AiStreamCommand, z.infer<typeof zAiStreamCommand>>({
  value: true
});
