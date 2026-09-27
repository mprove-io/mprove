import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRenameCatalogNodeInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  nodeId: string;
  newName: string;
};

export type ToBackendRenameCatalogNodeRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRenameCatalogNodeInput;
};

export let zToBackendRenameCatalogNodeInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    nodeId: z.string(),
    newName: z.string()
  })
  .meta({ id: 'ToBackendRenameCatalogNodeInput' });

export let zToBackendRenameCatalogNodeRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRenameCatalogNodeInput
  })
  .meta({ id: 'ToBackendRenameCatalogNodeRequest' });

assertTypesEqual<
  ToBackendRenameCatalogNodeInput,
  z.infer<typeof zToBackendRenameCatalogNodeInput>
>({ value: true });

assertTypesEqual<
  ToBackendRenameCatalogNodeRequest,
  z.infer<typeof zToBackendRenameCatalogNodeRequest>
>({ value: true });
