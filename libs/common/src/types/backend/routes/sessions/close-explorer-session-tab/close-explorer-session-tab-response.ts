import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCloseExplorerSessionTabOutput,
  zToBackendCloseExplorerSessionTabOutput
} from '#common/types/backend/routes/sessions/close-explorer-session-tab/close-explorer-session-tab-output';
import {
  type ToBackendCloseExplorerSessionTabError,
  zToBackendCloseExplorerSessionTabError
} from './close-explorer-session-tab-error';

export type ToBackendCloseExplorerSessionTabResponse = ToBackendResponseBase<
  'closeExplorerSessionTab',
  ToBackendCloseExplorerSessionTabOutput,
  ToBackendCloseExplorerSessionTabError
>;

export let zToBackendCloseExplorerSessionTabResponse =
  makeToBackendResponseSchema({
    operation: 'closeExplorerSessionTab',
    output: zToBackendCloseExplorerSessionTabOutput,
    error: zToBackendCloseExplorerSessionTabError
  }).meta({ id: 'ToBackendCloseExplorerSessionTabResponse' });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabResponse,
  z.infer<typeof zToBackendCloseExplorerSessionTabResponse>
>({ value: true });
