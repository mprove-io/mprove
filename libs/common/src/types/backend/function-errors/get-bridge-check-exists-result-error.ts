import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BridgeEntToTabResultError,
  zBridgeEntToTabResultError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-result-error';

export type GetBridgeCheckExistsResultError =
  | BackendBridgeBranchEnvDoesNotExistError
  | BridgeEntToTabResultError;

export let zGetBridgeCheckExistsResultError = z.union([
  zBackendBridgeBranchEnvDoesNotExistError,
  zBridgeEntToTabResultError
]);

assertTypesEqual<
  GetBridgeCheckExistsResultError,
  z.infer<typeof zGetBridgeCheckExistsResultError>
>({ value: true });
