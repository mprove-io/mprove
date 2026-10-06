import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const codexInputModalityValues = ['text', 'image', 'audio'] as const;

export type CodexInputModality = (typeof codexInputModalityValues)[number];

export let zCodexInputModality = z.enum(codexInputModalityValues);

assertTypesEqual<CodexInputModality, z.infer<typeof zCodexInputModality>>({
  value: true
});
