import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { BuilderLeft } from '#common/types/front/builder/builder-left';
import { zBuilderLeft } from '#common/types/front/builder/builder-left';

export type ToBackendGetFileRequest = {
  operation: 'getFile';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fileNodeId: string;
    builderLeft: BuilderLeft;
  };
};

export let zToBackendGetFileRequest = z
  .strictObject({
    operation: z.literal('getFile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fileNodeId: z.string(),
        builderLeft: zBuilderLeft
      })
      .meta({ id: 'ToBackendGetFileInput' })
  })
  .meta({ id: 'ToBackendGetFileRequest' });

assertTypesEqual<
  ToBackendGetFileRequest,
  z.infer<typeof zToBackendGetFileRequest>
>({ value: true });
