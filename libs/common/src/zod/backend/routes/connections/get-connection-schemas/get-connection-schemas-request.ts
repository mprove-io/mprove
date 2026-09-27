import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetConnectionSchemasInput = {
  projectId: string;
  envId: string;
  repoId: string;
  branchId: string;
  isRefreshExistingCache: boolean;
};

export type ToBackendGetConnectionSchemasRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetConnectionSchemasInput;
};

export let zToBackendGetConnectionSchemasInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    isRefreshExistingCache: z.boolean()
  })
  .meta({ id: 'ToBackendGetConnectionSchemasInput' });

export let zToBackendGetConnectionSchemasRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetConnectionSchemasInput
  })
  .meta({ id: 'ToBackendGetConnectionSchemasRequest' });

assertTypesEqual<
  ToBackendGetConnectionSchemasInput,
  z.infer<typeof zToBackendGetConnectionSchemasInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetConnectionSchemasRequest,
  z.infer<typeof zToBackendGetConnectionSchemasRequest>
>({ value: true });
