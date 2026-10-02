import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';

export type BackendModifyDashboardFailError = {
  code: 'BACKEND_MODIFY_DASHBOARD_FAIL';
  displayData?: { encodedFileId: string; structErrors: BmlError[] };
};

export let zBackendModifyDashboardFailError = z.object({
  code: z.literal('BACKEND_MODIFY_DASHBOARD_FAIL'),
  displayData: z
    .object({ encodedFileId: z.string(), structErrors: z.array(zBmlError) })
    .nullish()
});

assertTypesEqual<
  BackendModifyDashboardFailError,
  z.infer<typeof zBackendModifyDashboardFailError>
>({ value: true });
