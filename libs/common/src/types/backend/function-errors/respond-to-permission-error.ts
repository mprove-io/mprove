import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';

export type RespondToPermissionError = GetOpenCodeClientError;

export let zRespondToPermissionError = zGetOpenCodeClientError;

assertTypesEqual<
  RespondToPermissionError,
  z.infer<typeof zRespondToPermissionError>
>({ value: true });
