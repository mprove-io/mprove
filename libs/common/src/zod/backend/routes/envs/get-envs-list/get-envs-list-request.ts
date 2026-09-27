import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetEnvsListInput = {
  projectId: string;
  isFilter: boolean;
};

export type ToBackendGetEnvsListRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetEnvsListInput;
};

export let zToBackendGetEnvsListInput = z
  .object({
    projectId: z.string(),
    isFilter: z.boolean()
  })
  .meta({ id: 'ToBackendGetEnvsListInput' });

export let zToBackendGetEnvsListRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetEnvsListInput
  })
  .meta({ id: 'ToBackendGetEnvsListRequest' });

assertTypesEqual<
  ToBackendGetEnvsListInput,
  z.infer<typeof zToBackendGetEnvsListInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetEnvsListRequest,
  z.infer<typeof zToBackendGetEnvsListRequest>
>({ value: true });
