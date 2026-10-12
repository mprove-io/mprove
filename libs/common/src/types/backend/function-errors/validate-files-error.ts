import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CheckProjectIsNotRestrictedError,
  zCheckProjectIsNotRestrictedError
} from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import {
  type CheckRepoIdError,
  zCheckRepoIdError
} from '#common/types/backend/function-errors/check-repo-id-error';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type GetBranchCheckExistsError,
  zGetBranchCheckExistsError
} from '#common/types/backend/function-errors/get-branch-check-exists-error';
import {
  type GetEnvCheckExistsAndAccessError,
  zGetEnvCheckExistsAndAccessError
} from '#common/types/backend/function-errors/get-env-check-exists-and-access-error';
import {
  type GetMemberCheckIsEditorError,
  zGetMemberCheckIsEditorError
} from '#common/types/backend/function-errors/get-member-check-is-editor-error';
import {
  type GetModelPartXsError,
  zGetModelPartXsError
} from '#common/types/backend/function-errors/get-model-part-xs-error';
import {
  type GetProjectCheckExistsError,
  zGetProjectCheckExistsError
} from '#common/types/backend/function-errors/get-project-check-exists-error';
import {
  type GetStructCheckExistsError,
  zGetStructCheckExistsError
} from '#common/types/backend/function-errors/get-struct-check-exists-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type ValidateFilesError =
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckIsEditorError
  | CheckProjectIsNotRestrictedError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | SendToDiskError
  | RebuildStructError
  | DbErrorToError
  | GetStructCheckExistsError
  | GetModelPartXsError;

export let zValidateFilesError = z.union([
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckIsEditorError,
  zCheckProjectIsNotRestrictedError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zSendToDiskError,
  zRebuildStructError,
  zDbErrorToError,
  zGetStructCheckExistsError,
  zGetModelPartXsError
]);

assertTypesEqual<ValidateFilesError, z.infer<typeof zValidateFilesError>>({
  value: true
});
