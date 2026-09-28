import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGenerateProjectRemoteKeyOutput,
  zToBackendGenerateProjectRemoteKeyOutput
} from '#common/zod/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-output';
import {
  type ToBackendGenerateProjectRemoteKeyError,
  zToBackendGenerateProjectRemoteKeyError
} from './generate-project-remote-key-error';

export type ToBackendGenerateProjectRemoteKeyResponse = ToBackendResponseBase<
  'generateProjectRemoteKey',
  ToBackendGenerateProjectRemoteKeyOutput,
  ToBackendGenerateProjectRemoteKeyError
>;

export let zToBackendGenerateProjectRemoteKeyResponse =
  makeToBackendResponseSchema({
    operation: 'generateProjectRemoteKey',
    output: zToBackendGenerateProjectRemoteKeyOutput,
    error: zToBackendGenerateProjectRemoteKeyError
  }).meta({ id: 'ToBackendGenerateProjectRemoteKeyResponse' });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyResponse,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyResponse>
>({ value: true });
