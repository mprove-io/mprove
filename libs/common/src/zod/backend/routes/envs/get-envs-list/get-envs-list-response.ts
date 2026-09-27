import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvsItem, zEnvsItem } from '#common/zod/backend/envs-item';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetEnvsListError,
  zToBackendGetEnvsListError
} from './get-envs-list-error';

export type ToBackendGetEnvsListOutput = {
  envsList: EnvsItem[];
};

export type ToBackendGetEnvsListResponse = ToBackendResponse<
  ToBackendGetEnvsListOutput,
  ToBackendGetEnvsListError
>;

export let zToBackendGetEnvsListOutput = z
  .object({
    envsList: z.array(zEnvsItem)
  })
  .meta({ id: 'ToBackendGetEnvsListOutput' });

export let zToBackendGetEnvsListResponse = makeToBackendResponseSchema({
  success: zToBackendGetEnvsListOutput,
  error: zToBackendGetEnvsListError
}).meta({ id: 'ToBackendGetEnvsListResponse' });

assertTypesEqual<
  ToBackendGetEnvsListOutput,
  z.infer<typeof zToBackendGetEnvsListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetEnvsListResponse,
  z.infer<typeof zToBackendGetEnvsListResponse>
>({ value: true });
