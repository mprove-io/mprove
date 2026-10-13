import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetSessionByIdCheckExistsError,
  zGetSessionByIdCheckExistsError
} from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';

export type GetOpenCodeClientError = GetSessionByIdCheckExistsError;

export let zGetOpenCodeClientError = zGetSessionByIdCheckExistsError;

assertTypesEqual<
  GetOpenCodeClientError,
  z.infer<typeof zGetOpenCodeClientError>
>({ value: true });
