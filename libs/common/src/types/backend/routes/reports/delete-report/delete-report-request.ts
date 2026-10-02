import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteReportRequest = {
  operation: 'deleteReport';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    reportId: string;
  };
};

export let zToBackendDeleteReportRequest = z
  .strictObject({
    operation: z.literal('deleteReport'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        reportId: z.string()
      })
      .meta({ id: 'ToBackendDeleteReportInput' })
  })
  .meta({ id: 'ToBackendDeleteReportRequest' });

assertTypesEqual<
  ToBackendDeleteReportRequest,
  z.infer<typeof zToBackendDeleteReportRequest>
>({ value: true });
