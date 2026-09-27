import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteReportInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  reportId: string;
};

export type ToBackendDeleteReportRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteReportInput;
};

export let zToBackendDeleteReportInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportId: z.string()
  })
  .meta({ id: 'ToBackendDeleteReportInput' });

export let zToBackendDeleteReportRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteReportInput
  })
  .meta({ id: 'ToBackendDeleteReportRequest' });

assertTypesEqual<
  ToBackendDeleteReportInput,
  z.infer<typeof zToBackendDeleteReportInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteReportRequest,
  z.infer<typeof zToBackendDeleteReportRequest>
>({ value: true });
