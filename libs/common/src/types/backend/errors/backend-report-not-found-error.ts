import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendReportNotFoundError = {
  code: 'BACKEND_REPORT_NOT_FOUND';
  displayData?: { id: string };
};

export let zBackendReportNotFoundError = z.object({
  code: z.literal('BACKEND_REPORT_NOT_FOUND'),
  displayData: z.object({ id: z.string() }).nullish()
});

assertTypesEqual<
  BackendReportNotFoundError,
  z.infer<typeof zBackendReportNotFoundError>
>({ value: true });
