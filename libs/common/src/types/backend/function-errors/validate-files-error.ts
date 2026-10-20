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
  type DbBranchesFindFirstCheckExistsError,
  zDbBranchesFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/branches/db-branches-find-first-check-exists-error';
import {
  type DbBridgesFindManyError,
  zDbBridgesFindManyError
} from '#common/types/backend/function-errors/db/bridges/db-bridges-find-many-error';
import {
  type DbProjectsFindFirstCheckExistsError,
  zDbProjectsFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/projects/db-projects-find-first-check-exists-error';
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
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type ValidateFilesError =
  | CheckRepoIdError
  | DbProjectsFindFirstCheckExistsError
  | GetMemberCheckIsEditorError
  | CheckProjectIsNotRestrictedError
  | DbBranchesFindFirstCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | SendToDiskError
  | RebuildStructError
  | WriteError
  | GetStructCheckExistsError
  | GetModelPartXsError
  | DbBridgesFindManyError;

export let zValidateFilesError = z.union([
  zCheckRepoIdError,
  zDbProjectsFindFirstCheckExistsError,
  zGetMemberCheckIsEditorError,
  zCheckProjectIsNotRestrictedError,
  zDbBranchesFindFirstCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zSendToDiskError,
  zRebuildStructError,
  zWriteError,
  zGetStructCheckExistsError,
  zGetModelPartXsError,
  zDbBridgesFindManyError
]);

assertTypesEqual<ValidateFilesError, z.infer<typeof zValidateFilesError>>({
  value: true
});
