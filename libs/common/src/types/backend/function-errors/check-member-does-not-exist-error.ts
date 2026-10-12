import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberAlreadyExistsError,
  zBackendMemberAlreadyExistsError
} from '#common/types/backend/errors/backend-member-already-exists-error';

export type CheckMemberDoesNotExistError = BackendMemberAlreadyExistsError;

export let zCheckMemberDoesNotExistError = zBackendMemberAlreadyExistsError;

assertTypesEqual<
  CheckMemberDoesNotExistError,
  z.infer<typeof zCheckMemberDoesNotExistError>
>({ value: true });
