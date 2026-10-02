import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateExplorerSessionOutput,
  zToBackendCreateExplorerSessionOutput
} from '#common/types/backend/routes/sessions/create-explorer-session/create-explorer-session-output';
import {
  type ToBackendCreateExplorerSessionError,
  zToBackendCreateExplorerSessionError
} from './create-explorer-session-error';

export type ToBackendCreateExplorerSessionResponse = ToBackendResponseBase<
  'createExplorerSession',
  ToBackendCreateExplorerSessionOutput,
  ToBackendCreateExplorerSessionError
>;

export let zToBackendCreateExplorerSessionResponse =
  makeToBackendResponseSchema({
    operation: 'createExplorerSession',
    output: zToBackendCreateExplorerSessionOutput,
    error: zToBackendCreateExplorerSessionError
  }).meta({ id: 'ToBackendCreateExplorerSessionResponse' });

assertTypesEqual<
  ToBackendCreateExplorerSessionResponse,
  z.infer<typeof zToBackendCreateExplorerSessionResponse>
>({ value: true });
