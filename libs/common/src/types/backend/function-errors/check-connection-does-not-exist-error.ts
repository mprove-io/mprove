import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendConnectionAlreadyExistsError,
  zBackendConnectionAlreadyExistsError
} from '#common/types/backend/errors/backend-connection-already-exists-error';

export type CheckConnectionDoesNotExistError =
  BackendConnectionAlreadyExistsError;

export let zCheckConnectionDoesNotExistError =
  zBackendConnectionAlreadyExistsError;

assertTypesEqual<
  CheckConnectionDoesNotExistError,
  z.infer<typeof zCheckConnectionDoesNotExistError>
>({ value: true });
