import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type GetMemberCheckExistsError,
  zGetMemberCheckExistsError
} from '#common/types/backend/function-errors/get-member-check-exists-error';

export type GetMemberCheckIsAdminError =
  | GetMemberCheckExistsError
  | BackendMemberIsNotAdminError;

export let zGetMemberCheckIsAdminError = z.union([
  zGetMemberCheckExistsError,
  zBackendMemberIsNotAdminError
]);

assertTypesEqual<
  GetMemberCheckIsAdminError,
  z.infer<typeof zGetMemberCheckIsAdminError>
>({ value: true });
