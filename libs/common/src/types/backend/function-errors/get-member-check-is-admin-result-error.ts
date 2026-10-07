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
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type GetMemberCheckIsAdminResultError =
  | GetTabPropsResultError
  | BackendMemberDoesNotExistError
  | BackendMemberIsNotAdminError;

export let zGetMemberCheckIsAdminResultError = z.union([
  zGetTabPropsResultError,
  zBackendMemberDoesNotExistError,
  zBackendMemberIsNotAdminError
]);

assertTypesEqual<
  GetMemberCheckIsAdminResultError,
  z.infer<typeof zGetMemberCheckIsAdminResultError>
>({ value: true });
