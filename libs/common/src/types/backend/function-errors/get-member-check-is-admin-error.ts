import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendMemberIsNotAdminError,
  zBackendMemberIsNotAdminError
} from '#common/types/backend/errors/backend-member-is-not-admin-error';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type GetMemberCheckIsAdminError =
  | MemberEntToTabError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError;

export let zGetMemberCheckIsAdminError = z.union([
  zMemberEntToTabError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError
]);

assertTypesEqual<
  GetMemberCheckIsAdminError,
  z.infer<typeof zGetMemberCheckIsAdminError>
>({ value: true });
