import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type DbMembersFindFirstCheckExistsError,
  zDbMembersFindFirstCheckExistsError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-check-exists-error';

export type GetMemberCheckIsAdminError =
  | DbMembersFindFirstCheckExistsError
  | BackendMemberIsNotAdminError;

export let zGetMemberCheckIsAdminError = z.union([
  zDbMembersFindFirstCheckExistsError,
  zBackendMemberIsNotAdminError
]);

assertTypesEqual<
  GetMemberCheckIsAdminError,
  z.infer<typeof zGetMemberCheckIsAdminError>
>({ value: true });
