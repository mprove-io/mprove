import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/types/blockml/bml-error';

export type BackendCreateDashboardFailError = {
  code: 'BACKEND_CREATE_DASHBOARD_FAIL';
  displayData?: { encodedFileId: string; structErrors: BmlError[] };
};

export let zBackendCreateDashboardFailError = z.object({
  code: z.literal('BACKEND_CREATE_DASHBOARD_FAIL'),
  displayData: z
    .object({ encodedFileId: z.string(), structErrors: z.array(zBmlError) })
    .nullish()
});

assertTypesEqual<
  BackendCreateDashboardFailError,
  z.infer<typeof zBackendCreateDashboardFailError>
>({ value: true });
