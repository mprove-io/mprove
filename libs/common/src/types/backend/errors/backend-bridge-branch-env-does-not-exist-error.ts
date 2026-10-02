import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendBridgeBranchEnvDoesNotExistError = {
  code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST';
};

export let zBackendBridgeBranchEnvDoesNotExistError = z.object({
  code: z.literal('BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendBridgeBranchEnvDoesNotExistError,
  z.infer<typeof zBackendBridgeBranchEnvDoesNotExistError>
>({ value: true });
