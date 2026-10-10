import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberAlreadyExistsError,
  zBackendMemberAlreadyExistsError
} from '#common/types/backend/errors/backend-member-already-exists-error';

export type CheckMemberDoesNotExistResultError =
  BackendMemberAlreadyExistsError;

export let zCheckMemberDoesNotExistResultError =
  zBackendMemberAlreadyExistsError;

assertTypesEqual<
  CheckMemberDoesNotExistResultError,
  z.infer<typeof zCheckMemberDoesNotExistResultError>
>({ value: true });
