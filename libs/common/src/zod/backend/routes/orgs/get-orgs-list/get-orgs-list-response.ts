import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type OrgsItem, zOrgsItem } from '#common/zod/backend/orgs-item';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetOrgsListError,
  zToBackendGetOrgsListError
} from './get-orgs-list-error';

export type ToBackendGetOrgsListOutput = {
  orgsList: OrgsItem[];
};

export type ToBackendGetOrgsListResponse = ToBackendResponse<
  ToBackendGetOrgsListOutput,
  ToBackendGetOrgsListError
>;

export let zToBackendGetOrgsListOutput = z
  .object({
    orgsList: z.array(zOrgsItem)
  })
  .meta({ id: 'ToBackendGetOrgsListOutput' });

export let zToBackendGetOrgsListResponse = makeToBackendResponseSchema({
  success: zToBackendGetOrgsListOutput,
  error: zToBackendGetOrgsListError
}).meta({ id: 'ToBackendGetOrgsListResponse' });

assertTypesEqual<
  ToBackendGetOrgsListOutput,
  z.infer<typeof zToBackendGetOrgsListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetOrgsListResponse,
  z.infer<typeof zToBackendGetOrgsListResponse>
>({ value: true });
