import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendGetSessionsListError,
  zToBackendGetSessionsListError
} from './get-sessions-list-error';

export type ToBackendGetSessionsListOutput = {
  sessions: SessionApi[];
  hasMoreArchived?: boolean;
};

export type ToBackendGetSessionsListResponse = ToBackendResponse<
  ToBackendGetSessionsListOutput,
  ToBackendGetSessionsListError
>;

export let zToBackendGetSessionsListOutput = z
  .object({
    sessions: z.array(zSessionApi),
    hasMoreArchived: z.boolean().nullish()
  })
  .meta({ id: 'ToBackendGetSessionsListOutput' });

export let zToBackendGetSessionsListResponse = makeToBackendResponseSchema({
  success: zToBackendGetSessionsListOutput,
  error: zToBackendGetSessionsListError
}).meta({ id: 'ToBackendGetSessionsListResponse' });

assertTypesEqual<
  ToBackendGetSessionsListOutput,
  z.infer<typeof zToBackendGetSessionsListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSessionsListResponse,
  z.infer<typeof zToBackendGetSessionsListResponse>
>({ value: true });
