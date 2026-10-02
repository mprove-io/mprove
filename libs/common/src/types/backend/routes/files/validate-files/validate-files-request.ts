import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendValidateFilesRequest = {
  operation: 'validateFiles';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendValidateFilesRequest = z
  .strictObject({
    operation: z.literal('validateFiles'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendValidateFilesInput' })
  })
  .meta({ id: 'ToBackendValidateFilesRequest' });

assertTypesEqual<
  ToBackendValidateFilesRequest,
  z.infer<typeof zToBackendValidateFilesRequest>
>({ value: true });
