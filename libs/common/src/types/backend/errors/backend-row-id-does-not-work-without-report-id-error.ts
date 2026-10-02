import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendRowIdDoesNotWorkWithoutReportIdError = {
  code: 'BACKEND_ROW_ID_DOES_NOT_WORK_WITHOUT_REPORT_ID';
};

export let zBackendRowIdDoesNotWorkWithoutReportIdError = z.object({
  code: z.literal('BACKEND_ROW_ID_DOES_NOT_WORK_WITHOUT_REPORT_ID')
});

assertTypesEqual<
  BackendRowIdDoesNotWorkWithoutReportIdError,
  z.infer<typeof zBackendRowIdDoesNotWorkWithoutReportIdError>
>({ value: true });
