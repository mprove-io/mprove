import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetReportsRequest = {
  operation: 'getReports';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  };
};

export let zToBackendGetReportsRequest = z
  .strictObject({
    operation: z.literal('getReports'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string()
      })
      .meta({ id: 'ToBackendGetReportsInput' })
  })
  .meta({ id: 'ToBackendGetReportsRequest' });

assertTypesEqual<
  ToBackendGetReportsRequest,
  z.infer<typeof zToBackendGetReportsRequest>
>({ value: true });
