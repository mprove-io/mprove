import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionAlreadyExistsError,
  zBackendConnectionAlreadyExistsError
} from '#common/types/backend/errors/backend-connection-already-exists-error';

export type CheckConnectionDoesNotExistResultError =
  BackendConnectionAlreadyExistsError;

export let zCheckConnectionDoesNotExistResultError =
  zBackendConnectionAlreadyExistsError;

assertTypesEqual<
  CheckConnectionDoesNotExistResultError,
  z.infer<typeof zCheckConnectionDoesNotExistResultError>
>({ value: true });
