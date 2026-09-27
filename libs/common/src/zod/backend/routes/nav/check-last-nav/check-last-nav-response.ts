import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCheckLastNavError,
  zToBackendCheckLastNavError
} from './check-last-nav-error';

export type ToBackendCheckLastNavOutput = {
  modelExists: boolean;
  chartExists: boolean;
  dashboardExists: boolean;
  reportExists: boolean;
};

export type ToBackendCheckLastNavResponse = ToBackendResponse<
  ToBackendCheckLastNavOutput,
  ToBackendCheckLastNavError
>;

export let zToBackendCheckLastNavOutput = z
  .object({
    modelExists: z.boolean(),
    chartExists: z.boolean(),
    dashboardExists: z.boolean(),
    reportExists: z.boolean()
  })
  .meta({ id: 'ToBackendCheckLastNavOutput' });

export let zToBackendCheckLastNavResponse = makeToBackendResponseSchema({
  success: zToBackendCheckLastNavOutput,
  error: zToBackendCheckLastNavError
}).meta({ id: 'ToBackendCheckLastNavResponse' });

assertTypesEqual<
  ToBackendCheckLastNavOutput,
  z.infer<typeof zToBackendCheckLastNavOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCheckLastNavResponse,
  z.infer<typeof zToBackendCheckLastNavResponse>
>({ value: true });
