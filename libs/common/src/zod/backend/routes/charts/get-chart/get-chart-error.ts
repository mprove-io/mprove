import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendBranchDoesNotExistError,
  zBackendBranchDoesNotExistError
} from '#common/zod/backend/errors/backend-branch-does-not-exist-error';
import {
  type BackendBridgeBranchEnvDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-bridge-branch-env-does-not-exist-error';
import {
  type BackendChartCreatorIdMismatchError,
  zBackendChartCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-chart-creator-id-mismatch-error';
import {
  type BackendChartDoesNotExistError,
  zBackendChartDoesNotExistError
} from '#common/zod/backend/errors/backend-chart-does-not-exist-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/zod/backend/errors/backend-forbidden-model-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/zod/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/zod/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendMalloyConnectionCloseError,
  zBackendMalloyConnectionCloseError
} from '#common/zod/backend/errors/backend-malloy-connection-close-error';
import {
  type BackendMconfigDoesNotExistError,
  zBackendMconfigDoesNotExistError
} from '#common/zod/backend/errors/backend-mconfig-does-not-exist-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendMemberIsNotExplorerError,
  zBackendMemberIsNotExplorerError
} from '#common/zod/backend/errors/backend-member-is-not-explorer-error';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/zod/backend/errors/backend-model-does-not-exist-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/zod/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendTransactionRetryError,
  zBackendTransactionRetryError
} from '#common/zod/backend/errors/backend-transaction-retry-error';
import {
  type BlockmlUnexpectedUrlReadError,
  zBlockmlUnexpectedUrlReadError
} from '#common/zod/backend/errors/blockml-unexpected-url-read-error';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/zod/backend/errors/malloy-to-query-failed-error';

export type ToBackendGetChartError =
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | BackendChartDoesNotExistError
  | BackendEnvDoesNotExistError
  | BackendForbiddenModelError
  | BackendForbiddenRepoIdError
  | BackendHashSecretIsNotDefinedError
  | BackendMalloyConnectionCloseError
  | BackendMconfigDoesNotExistError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendMemberIsNotExplorerError
  | BackendModelDoesNotExistError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendStructDoesNotExistError
  | BackendTransactionRetryError
  | BlockmlUnexpectedUrlReadError
  | MalloyToQueryFailedError;

export let zToBackendGetChartError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zBackendChartDoesNotExistError,
  zBackendEnvDoesNotExistError,
  zBackendForbiddenModelError,
  zBackendForbiddenRepoIdError,
  zBackendHashSecretIsNotDefinedError,
  zBackendMalloyConnectionCloseError,
  zBackendMconfigDoesNotExistError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberIsNotExplorerError,
  zBackendModelDoesNotExistError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendStructDoesNotExistError,
  zBackendTransactionRetryError,
  zBlockmlUnexpectedUrlReadError,
  zMalloyToQueryFailedError
]);

assertTypesEqual<
  ToBackendGetChartError,
  z.infer<typeof zToBackendGetChartError>
>({ value: true });
