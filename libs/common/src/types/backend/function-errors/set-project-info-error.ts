import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToResultError,
  zDbErrorToResultError
} from '#common/types/backend/function-errors/db-error-to-result-error';
import {
  type GetMemberCheckIsAdminResultError,
  zGetMemberCheckIsAdminResultError
} from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import {
  type GetProjectCheckExistsResultError,
  zGetProjectCheckExistsResultError
} from '#common/types/backend/function-errors/get-project-check-exists-result-error';

export type SetProjectInfoError =
  | GetProjectCheckExistsResultError
  | GetMemberCheckIsAdminResultError
  | DbErrorToResultError;

export let zSetProjectInfoError = z.union([
  zGetProjectCheckExistsResultError,
  zGetMemberCheckIsAdminResultError,
  zDbErrorToResultError
]);

assertTypesEqual<SetProjectInfoError, z.infer<typeof zSetProjectInfoError>>({
  value: true
});
