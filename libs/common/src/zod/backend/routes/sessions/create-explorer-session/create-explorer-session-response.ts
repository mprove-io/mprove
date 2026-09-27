import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateExplorerSessionError,
  zToBackendCreateExplorerSessionError
} from './create-explorer-session-error';

export type ToBackendCreateExplorerSessionOutput = {
  sessionId: string;
  repoId: string;
  branchId: string;
  envId: string;
};

export type ToBackendCreateExplorerSessionResponse = ToBackendResponse<
  ToBackendCreateExplorerSessionOutput,
  ToBackendCreateExplorerSessionError
>;

export let zToBackendCreateExplorerSessionOutput = z
  .object({
    sessionId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendCreateExplorerSessionOutput' });

export let zToBackendCreateExplorerSessionResponse =
  makeToBackendResponseSchema({
    success: zToBackendCreateExplorerSessionOutput,
    error: zToBackendCreateExplorerSessionError
  }).meta({ id: 'ToBackendCreateExplorerSessionResponse' });

assertTypesEqual<
  ToBackendCreateExplorerSessionOutput,
  z.infer<typeof zToBackendCreateExplorerSessionOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateExplorerSessionResponse,
  z.infer<typeof zToBackendCreateExplorerSessionResponse>
>({ value: true });
