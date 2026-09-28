import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/zod/backend/errors/backend-member-does-not-exist-error';

export type ToBackendGetUserGivensError = BackendMemberDoesNotExistError;

export let zToBackendGetUserGivensError = zBackendMemberDoesNotExistError;

assertTypesEqual<
  ToBackendGetUserGivensError,
  z.infer<typeof zToBackendGetUserGivensError>
>({ value: true });
