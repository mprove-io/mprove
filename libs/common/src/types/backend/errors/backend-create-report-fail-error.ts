import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/types/blockml/bml-error';

export type BackendCreateReportFailError = {
  code: 'BACKEND_CREATE_REPORT_FAIL';
  displayData?: { encodedFileId: string; structErrors: BmlError[] };
};

export let zBackendCreateReportFailError = z.object({
  code: z.literal('BACKEND_CREATE_REPORT_FAIL'),
  displayData: z
    .object({ encodedFileId: z.string(), structErrors: z.array(zBmlError) })
    .nullish()
});

assertTypesEqual<
  BackendCreateReportFailError,
  z.infer<typeof zBackendCreateReportFailError>
>({ value: true });
