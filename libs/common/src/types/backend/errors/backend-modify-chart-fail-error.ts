import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BmlError,
  zBmlError
} from '#common/types/blockml/parts/bml-error';

export type BackendModifyChartFailError = {
  code: 'BACKEND_MODIFY_CHART_FAIL';
  displayData?: { encodedFileId: string; structErrors: BmlError[] };
};

export let zBackendModifyChartFailError = z.object({
  code: z.literal('BACKEND_MODIFY_CHART_FAIL'),
  displayData: z
    .object({ encodedFileId: z.string(), structErrors: z.array(zBmlError) })
    .nullish()
});

assertTypesEqual<
  BackendModifyChartFailError,
  z.infer<typeof zBackendModifyChartFailError>
>({ value: true });
