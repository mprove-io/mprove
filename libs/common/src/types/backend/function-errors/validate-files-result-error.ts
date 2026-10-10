import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckProjectIsNotRestrictedResultError,
  zCheckProjectIsNotRestrictedResultError
} from '#common/types/backend/function-errors/check-project-is-not-restricted-result-error';
import {
  type CheckRepoIdResultError,
  zCheckRepoIdResultError
} from '#common/types/backend/function-errors/check-repo-id-result-error';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type GetBranchCheckExistsResultError,
  zGetBranchCheckExistsResultError
} from '#common/types/backend/function-errors/get-branch-check-exists-result-error';
import {
  type GetEnvCheckExistsAndAccessResultError,
  zGetEnvCheckExistsAndAccessResultError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-result-error';
import {
  type GetMemberCheckIsEditorResultError,
  zGetMemberCheckIsEditorResultError
} from '#common/types/backend/function-errors/get-member-check-is-editor-result-error';
import {
  type GetModelPartXsResultError,
  zGetModelPartXsResultError
} from '#common/types/backend/function-errors/get-model-part-xs-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';
import {
  type GetStructCheckExistsResultError,
  zGetStructCheckExistsResultError
} from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import {
  type RebuildStructResultError,
  zRebuildStructResultError
} from '#common/types/backend/function-errors/rebuild-struct-result-error';
import {
  type SendToDiskResultError,
  zSendToDiskResultError
} from '#common/types/backend/function-errors/send-to-disk-result-error';

export type ValidateFilesResultError =
  | CheckRepoIdResultError
  | GetProjectCheckExistsResultError
  | GetMemberCheckIsEditorResultError
  | CheckProjectIsNotRestrictedResultError
  | GetBranchCheckExistsResultError
  | GetEnvCheckExistsAndAccessResultError
  | SendToDiskResultError
  | RebuildStructResultError
  | DbErrorToResultError
  | GetStructCheckExistsResultError
  | GetModelPartXsResultError;

export let zValidateFilesResultError = z.union([
  zCheckRepoIdResultError,
  zGetProjectCheckExistsResultError,
  zGetMemberCheckIsEditorResultError,
  zCheckProjectIsNotRestrictedResultError,
  zGetBranchCheckExistsResultError,
  zGetEnvCheckExistsAndAccessResultError,
  zSendToDiskResultError,
  zRebuildStructResultError,
  zDbErrorToResultError,
  zGetStructCheckExistsResultError,
  zGetModelPartXsResultError
]);

assertTypesEqual<
  ValidateFilesResultError,
  z.infer<typeof zValidateFilesResultError>
>({ value: true });
