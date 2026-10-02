import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/types/blockml/bml-error';

export type BackendModifyReportFailError = {
  code: 'BACKEND_MODIFY_REPORT_FAIL';
  displayData?: { encodedFileId: string; structErrors: BmlError[] };
};

export let zBackendModifyReportFailError = z.object({
  code: z.literal('BACKEND_MODIFY_REPORT_FAIL'),
  displayData: z
    .object({ encodedFileId: z.string(), structErrors: z.array(zBmlError) })
    .nullish()
});

assertTypesEqual<
  BackendModifyReportFailError,
  z.infer<typeof zBackendModifyReportFailError>
>({ value: true });
