import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetProjectsListInput = {
  orgId: string;
};

export type ToBackendGetProjectsListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetProjectsListInput;
};

export let zToBackendGetProjectsListInput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToBackendGetProjectsListInput' });

export let zToBackendGetProjectsListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetProjectsListInput
  })
  .meta({ id: 'ToBackendGetProjectsListRequest' });

assertTypesEqual<
  ToBackendGetProjectsListInput,
  z.infer<typeof zToBackendGetProjectsListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProjectsListRequest,
  z.infer<typeof zToBackendGetProjectsListRequest>
>({ value: true });
