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
  type BackendDashboardCreatorIdMismatchError,
  zBackendDashboardCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-dashboard-creator-id-mismatch-error';
import {
  type BackendDashboardDoesNotExistError,
  zBackendDashboardDoesNotExistError
} from '#common/zod/backend/errors/backend-dashboard-does-not-exist-error';
import {
  type BackendEnvDoesNotExistError,
  zBackendEnvDoesNotExistError
} from '#common/zod/backend/errors/backend-env-does-not-exist-error';
import {
  type BackendForbiddenDashboardError,
  zBackendForbiddenDashboardError
} from '#common/zod/backend/errors/backend-forbidden-dashboard-error';
import {
  type BackendForbiddenModelError,
  zBackendForbiddenModelError
} from '#common/zod/backend/errors/backend-forbidden-model-error';
import {
  type BackendForbiddenRepoIdError,
  zBackendForbiddenRepoIdError
} from '#common/zod/backend/errors/backend-forbidden-repo-id-error';
import {
  type BackendForbiddenReportError,
  zBackendForbiddenReportError
} from '#common/zod/backend/errors/backend-forbidden-report-error';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberDoesNotHaveAccessToEnvError,
  zBackendMemberDoesNotHaveAccessToEnvError
} from '#common/zod/backend/errors/backend-member-does-not-have-access-to-env-error';
import {
  type BackendModelDoesNotExistError,
  zBackendModelDoesNotExistError
} from '#common/zod/backend/errors/backend-model-does-not-exist-error';
import {
  type BackendModelIdIsNotDefinedError,
  zBackendModelIdIsNotDefinedError
} from '#common/zod/backend/errors/backend-model-id-is-not-defined-error';
import {
  type BackendProductionRepoNotAllowedError,
  zBackendProductionRepoNotAllowedError
} from '#common/zod/backend/errors/backend-production-repo-not-allowed-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/zod/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendQueriesDoNotExistError,
  zBackendQueriesDoNotExistError
} from '#common/zod/backend/errors/backend-queries-do-not-exist-error';
import {
  type BackendReportCreatorIdMismatchError,
  zBackendReportCreatorIdMismatchError
} from '#common/zod/backend/errors/backend-report-creator-id-mismatch-error';
import {
  type BackendReportNotFoundError,
  zBackendReportNotFoundError
} from '#common/zod/backend/errors/backend-report-not-found-error';
import {
  type BackendStructDoesNotExistError,
  zBackendStructDoesNotExistError
} from '#common/zod/backend/errors/backend-struct-does-not-exist-error';
import {
  type BackendSuggestFieldNotFoundError,
  zBackendSuggestFieldNotFoundError
} from '#common/zod/backend/errors/backend-suggest-field-not-found-error';

export type ToBackendGetQueriesError =
  | BackendBranchDoesNotExistError
  | BackendBridgeBranchEnvDoesNotExistError
  | BackendChartCreatorIdMismatchError
  | BackendChartDoesNotExistError
  | BackendDashboardCreatorIdMismatchError
  | BackendDashboardDoesNotExistError
  | BackendEnvDoesNotExistError
  | BackendForbiddenDashboardError
  | BackendForbiddenModelError
  | BackendForbiddenReportError
  | BackendForbiddenRepoIdError
  | BackendMemberDoesNotExistError
  | BackendMemberDoesNotHaveAccessToEnvError
  | BackendModelDoesNotExistError
  | BackendModelIdIsNotDefinedError
  | BackendProductionRepoNotAllowedError
  | BackendProjectDoesNotExistError
  | BackendQueriesDoNotExistError
  | BackendReportCreatorIdMismatchError
  | BackendReportNotFoundError
  | BackendStructDoesNotExistError
  | BackendSuggestFieldNotFoundError;

export let zToBackendGetQueriesError = z.discriminatedUnion('code', [
  zBackendBranchDoesNotExistError,
  zBackendBridgeBranchEnvDoesNotExistError,
  zBackendChartCreatorIdMismatchError,
  zBackendChartDoesNotExistError,
  zBackendDashboardCreatorIdMismatchError,
  zBackendDashboardDoesNotExistError,
  zBackendEnvDoesNotExistError,
  zBackendForbiddenDashboardError,
  zBackendForbiddenModelError,
  zBackendForbiddenReportError,
  zBackendForbiddenRepoIdError,
  zBackendMemberDoesNotExistError,
  zBackendMemberDoesNotHaveAccessToEnvError,
  zBackendModelDoesNotExistError,
  zBackendModelIdIsNotDefinedError,
  zBackendProductionRepoNotAllowedError,
  zBackendProjectDoesNotExistError,
  zBackendQueriesDoNotExistError,
  zBackendReportCreatorIdMismatchError,
  zBackendReportNotFoundError,
  zBackendStructDoesNotExistError,
  zBackendSuggestFieldNotFoundError
]);

assertTypesEqual<
  ToBackendGetQueriesError,
  z.infer<typeof zToBackendGetQueriesError>
>({ value: true });
