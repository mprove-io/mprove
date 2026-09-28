import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDuplicateMconfigAndQueryOutput,
  zToBackendDuplicateMconfigAndQueryOutput
} from '#common/zod/backend/routes/mconfigs/duplicate-mconfig-and-query/duplicate-mconfig-and-query-output';
import {
  type ToBackendDuplicateMconfigAndQueryError,
  zToBackendDuplicateMconfigAndQueryError
} from './duplicate-mconfig-and-query-error';

export type ToBackendDuplicateMconfigAndQueryResponse = ToBackendResponseBase<
  'duplicateMconfigAndQuery',
  ToBackendDuplicateMconfigAndQueryOutput,
  ToBackendDuplicateMconfigAndQueryError
>;

export let zToBackendDuplicateMconfigAndQueryResponse =
  makeToBackendResponseSchema({
    operation: 'duplicateMconfigAndQuery',
    output: zToBackendDuplicateMconfigAndQueryOutput,
    error: zToBackendDuplicateMconfigAndQueryError
  }).meta({ id: 'ToBackendDuplicateMconfigAndQueryResponse' });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryResponse,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryResponse>
>({ value: true });
