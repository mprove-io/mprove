import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type BmlError, zBmlError } from '#common/types/blockml/bml-error';

export type BackendCreateChartFailError = {
  code: 'BACKEND_CREATE_CHART_FAIL';
  displayData?: { structErrors: BmlError[]; encodedFileId?: string };
};

export let zBackendCreateChartFailError = z.object({
  code: z.literal('BACKEND_CREATE_CHART_FAIL'),
  displayData: z
    .object({
      structErrors: z.array(zBmlError),
      encodedFileId: z.string().nullish()
    })
    .nullish()
});

assertTypesEqual<
  BackendCreateChartFailError,
  z.infer<typeof zBackendCreateChartFailError>
>({ value: true });
