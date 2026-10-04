import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const codexVisibilityValues = ['list', 'hide', 'none'] as const;

export type CodexVisibility = (typeof codexVisibilityValues)[number];

export let zCodexVisibility = z.enum(codexVisibilityValues);

assertTypesEqual<CodexVisibility, z.infer<typeof zCodexVisibility>>({
  value: true
});
