import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendReportCreatorIdMismatchError = {
  code: 'BACKEND_REPORT_CREATOR_ID_MISMATCH';
};

export let zBackendReportCreatorIdMismatchError = z.object({
  code: z.literal('BACKEND_REPORT_CREATOR_ID_MISMATCH')
});

assertTypesEqual<
  BackendReportCreatorIdMismatchError,
  z.infer<typeof zBackendReportCreatorIdMismatchError>
>({ value: true });
