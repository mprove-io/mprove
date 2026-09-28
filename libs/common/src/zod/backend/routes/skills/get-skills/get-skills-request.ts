import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSkillsRequest = {
  operation: 'getSkills';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendGetSkillsRequest = z
  .strictObject({
    operation: z.literal('getSkills'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendGetSkillsInput' })
  })
  .meta({ id: 'ToBackendGetSkillsRequest' });

assertTypesEqual<
  ToBackendGetSkillsRequest,
  z.infer<typeof zToBackendGetSkillsRequest>
>({ value: true });
