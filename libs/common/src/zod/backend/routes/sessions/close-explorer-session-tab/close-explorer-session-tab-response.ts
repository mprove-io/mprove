import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCloseExplorerSessionTabError,
  zToBackendCloseExplorerSessionTabError
} from './close-explorer-session-tab-error';

export type ToBackendCloseExplorerSessionTabOutput = Record<string, never>;

export type ToBackendCloseExplorerSessionTabResponse = ToBackendResponse<
  ToBackendCloseExplorerSessionTabOutput,
  ToBackendCloseExplorerSessionTabError
>;

export let zToBackendCloseExplorerSessionTabOutput = z
  .object({})
  .meta({ id: 'ToBackendCloseExplorerSessionTabOutput' });

export let zToBackendCloseExplorerSessionTabResponse =
  makeToBackendResponseSchema({
    success: zToBackendCloseExplorerSessionTabOutput,
    error: zToBackendCloseExplorerSessionTabError
  }).meta({ id: 'ToBackendCloseExplorerSessionTabResponse' });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabOutput,
  z.infer<typeof zToBackendCloseExplorerSessionTabOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabResponse,
  z.infer<typeof zToBackendCloseExplorerSessionTabResponse>
>({ value: true });
