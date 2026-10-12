import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/types/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BridgeEntToTabError,
  zBridgeEntToTabError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-error';

export type GetBridgeCheckExistsError =
  | BackendBridgeBranchEnvDoesNotExistError
  | BridgeEntToTabError;

export let zGetBridgeCheckExistsError = z.union([
  zBackendBridgeBranchEnvDoesNotExistError,
  zBridgeEntToTabError
]);

assertTypesEqual<
  GetBridgeCheckExistsError,
  z.infer<typeof zGetBridgeCheckExistsError>
>({ value: true });
