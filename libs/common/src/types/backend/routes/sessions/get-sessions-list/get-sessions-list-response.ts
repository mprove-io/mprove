import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetSessionsListOutput,
  zToBackendGetSessionsListOutput
} from '#common/types/backend/routes/sessions/get-sessions-list/get-sessions-list-output';
import {
  type ToBackendGetSessionsListError,
  zToBackendGetSessionsListError
} from './get-sessions-list-error';

export type ToBackendGetSessionsListResponse = ToBackendResponseBase<
  'getSessionsList',
  ToBackendGetSessionsListOutput,
  ToBackendGetSessionsListError
>;

export let zToBackendGetSessionsListResponse = makeToBackendResponseSchema({
  operation: 'getSessionsList',
  output: zToBackendGetSessionsListOutput,
  error: zToBackendGetSessionsListError
}).meta({ id: 'ToBackendGetSessionsListResponse' });

assertTypesEqual<
  ToBackendGetSessionsListResponse,
  z.infer<typeof zToBackendGetSessionsListResponse>
>({ value: true });
