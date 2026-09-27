import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGenerateProjectRemoteKeyError,
  zToBackendGenerateProjectRemoteKeyError
} from './generate-project-remote-key-error';

export type ToBackendGenerateProjectRemoteKeyOutput = {
  noteId: string;
  publicKey: string;
};

export type ToBackendGenerateProjectRemoteKeyResponse = ToBackendResponse<
  ToBackendGenerateProjectRemoteKeyOutput,
  ToBackendGenerateProjectRemoteKeyError
>;

export let zToBackendGenerateProjectRemoteKeyOutput = z
  .object({
    noteId: z.string(),
    publicKey: z.string()
  })
  .meta({ id: 'ToBackendGenerateProjectRemoteKeyOutput' });

export let zToBackendGenerateProjectRemoteKeyResponse =
  makeToBackendResponseSchema({
    success: zToBackendGenerateProjectRemoteKeyOutput,
    error: zToBackendGenerateProjectRemoteKeyError
  }).meta({ id: 'ToBackendGenerateProjectRemoteKeyResponse' });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyOutput,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGenerateProjectRemoteKeyResponse,
  z.infer<typeof zToBackendGenerateProjectRemoteKeyResponse>
>({ value: true });
