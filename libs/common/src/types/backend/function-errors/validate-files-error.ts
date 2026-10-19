import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BridgeEntToTabError,
  zBridgeEntToTabError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import {
  type CheckProjectIsNotRestrictedError,
  zCheckProjectIsNotRestrictedError
} from '#common/types/backend/function-errors/check-project-is-not-restricted-error';
import {
  type CheckRepoIdError,
  zCheckRepoIdError
} from '#common/types/backend/function-errors/check-repo-id-error';
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
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type ValidateFilesError =
  | BridgeEntToTabError
  | CheckRepoIdError
  | GetProjectCheckExistsError
  | GetMemberCheckIsEditorError
  | CheckProjectIsNotRestrictedError
  | GetBranchCheckExistsError
  | GetEnvCheckExistsAndAccessError
  | SendToDiskError
  | RebuildStructError
  | WriteError
  | GetStructCheckExistsError
  | GetModelPartXsError;

export let zValidateFilesError = z.union([
  zBridgeEntToTabError,
  zCheckRepoIdError,
  zGetProjectCheckExistsError,
  zGetMemberCheckIsEditorError,
  zCheckProjectIsNotRestrictedError,
  zGetBranchCheckExistsError,
  zGetEnvCheckExistsAndAccessError,
  zSendToDiskError,
  zRebuildStructError,
  zWriteError,
  zGetStructCheckExistsError,
  zGetModelPartXsError
]);

assertTypesEqual<ValidateFilesError, z.infer<typeof zValidateFilesError>>({
  value: true
});
