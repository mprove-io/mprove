import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SessionApi, zSessionApi } from '#common/zod/backend/session-api';
import {
  type ToBackendPauseEditorSessionError,
  zToBackendPauseEditorSessionError
} from './pause-editor-session-error';

export type ToBackendPauseEditorSessionOutput = {
  session: SessionApi;
};

export type ToBackendPauseEditorSessionResponse = ToBackendResponse<
  ToBackendPauseEditorSessionOutput,
  ToBackendPauseEditorSessionError
>;

export let zToBackendPauseEditorSessionOutput = z
  .object({
    session: zSessionApi
  })
  .meta({ id: 'ToBackendPauseEditorSessionOutput' });

export let zToBackendPauseEditorSessionResponse = makeToBackendResponseSchema({
  success: zToBackendPauseEditorSessionOutput,
  error: zToBackendPauseEditorSessionError
}).meta({ id: 'ToBackendPauseEditorSessionResponse' });

assertTypesEqual<
  ToBackendPauseEditorSessionOutput,
  z.infer<typeof zToBackendPauseEditorSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendPauseEditorSessionResponse,
  z.infer<typeof zToBackendPauseEditorSessionResponse>
>({ value: true });
