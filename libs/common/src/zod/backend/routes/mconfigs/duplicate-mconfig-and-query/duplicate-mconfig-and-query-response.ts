import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type Query, zQuery } from '#common/zod/blockml/query';
import {
  type ToBackendDuplicateMconfigAndQueryError,
  zToBackendDuplicateMconfigAndQueryError
} from './duplicate-mconfig-and-query-error';

export type ToBackendDuplicateMconfigAndQueryOutput = {
  mconfig: MconfigX;
  query: Query;
};

export type ToBackendDuplicateMconfigAndQueryResponse = ToBackendResponse<
  ToBackendDuplicateMconfigAndQueryOutput,
  ToBackendDuplicateMconfigAndQueryError
>;

export let zToBackendDuplicateMconfigAndQueryOutput = z
  .object({
    mconfig: zMconfigX,
    query: zQuery
  })
  .meta({ id: 'ToBackendDuplicateMconfigAndQueryOutput' });

export let zToBackendDuplicateMconfigAndQueryResponse =
  makeToBackendResponseSchema({
    success: zToBackendDuplicateMconfigAndQueryOutput,
    error: zToBackendDuplicateMconfigAndQueryError
  }).meta({ id: 'ToBackendDuplicateMconfigAndQueryResponse' });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryOutput,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryResponse,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryResponse>
>({ value: true });
