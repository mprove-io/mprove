import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateEditorSessionError,
  zToBackendCreateEditorSessionError
} from './create-editor-session-error';

export type ToBackendCreateEditorSessionOutput = {
  sessionId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendCreateEditorSessionResponse = ToBackendResponse<
  ToBackendCreateEditorSessionOutput,
  ToBackendCreateEditorSessionError
>;

export let zToBackendCreateEditorSessionOutput = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateEditorSessionOutput' });

export let zToBackendCreateEditorSessionResponse = makeToBackendResponseSchema({
  success: zToBackendCreateEditorSessionOutput,
  error: zToBackendCreateEditorSessionError
}).meta({ id: 'ToBackendCreateEditorSessionResponse' });

assertTypesEqual<
  ToBackendCreateEditorSessionOutput,
  z.infer<typeof zToBackendCreateEditorSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEditorSessionResponse,
  z.infer<typeof zToBackendCreateEditorSessionResponse>
>({ value: true });
