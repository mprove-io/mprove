import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteDraftReportsRequest = {
  operation: 'deleteDraftReports';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    reportIds: string[];
  };
};

export let zToBackendDeleteDraftReportsRequest = z
  .strictObject({
    operation: z.literal('deleteDraftReports'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        reportIds: z.array(z.string())
      })
      .meta({ id: 'ToBackendDeleteDraftReportsInput' })
  })
  .meta({ id: 'ToBackendDeleteDraftReportsRequest' });

assertTypesEqual<
  ToBackendDeleteDraftReportsRequest,
  z.infer<typeof zToBackendDeleteDraftReportsRequest>
>({ value: true });
