import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSkillsInput = Record<string, never>;

export type ToBackendGetSkillsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetSkillsInput;
};

export let zToBackendGetSkillsInput = z
  .object({})
  .meta({ id: 'ToBackendGetSkillsInput' });

export let zToBackendGetSkillsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetSkillsInput
  })
  .meta({ id: 'ToBackendGetSkillsRequest' });

assertTypesEqual<
  ToBackendGetSkillsInput,
  z.infer<typeof zToBackendGetSkillsInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSkillsRequest,
  z.infer<typeof zToBackendGetSkillsRequest>
>({ value: true });
