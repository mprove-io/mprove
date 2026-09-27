import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendArchiveSessionError,
  zToBackendArchiveSessionError
} from './archive-session-error';

export type ToBackendArchiveSessionOutput = {
  session: SessionApi;
};

export type ToBackendArchiveSessionResponse = ToBackendResponse<
  ToBackendArchiveSessionOutput,
  ToBackendArchiveSessionError
>;

export let zToBackendArchiveSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendArchiveSessionOutput' });

export let zToBackendArchiveSessionResponse = makeToBackendResponseSchema({
  success: zToBackendArchiveSessionOutput,
  error: zToBackendArchiveSessionError
}).meta({ id: 'ToBackendArchiveSessionResponse' });

assertTypesEqual<
  ToBackendArchiveSessionOutput,
  z.infer<typeof zToBackendArchiveSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendArchiveSessionResponse,
  z.infer<typeof zToBackendArchiveSessionResponse>
>({ value: true });
