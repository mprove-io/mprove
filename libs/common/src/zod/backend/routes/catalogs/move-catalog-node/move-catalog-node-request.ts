import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendMoveCatalogNodeInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fromNodeId: string;
  toNodeId: string;
};

export type ToBackendMoveCatalogNodeRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendMoveCatalogNodeInput;
};

export let zToBackendMoveCatalogNodeInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromNodeId: z.string(),
    toNodeId: z.string()
  })
  .meta({ id: 'ToBackendMoveCatalogNodeInput' });

export let zToBackendMoveCatalogNodeRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendMoveCatalogNodeInput
  })
  .meta({ id: 'ToBackendMoveCatalogNodeRequest' });

assertTypesEqual<
  ToBackendMoveCatalogNodeInput,
  z.infer<typeof zToBackendMoveCatalogNodeInput>
>({ value: true });

assertTypesEqual<
  ToBackendMoveCatalogNodeRequest,
  z.infer<typeof zToBackendMoveCatalogNodeRequest>
>({ value: true });
