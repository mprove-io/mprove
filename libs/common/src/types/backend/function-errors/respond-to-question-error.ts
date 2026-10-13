import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';

export type RespondToQuestionError = GetOpenCodeClientError;

export let zRespondToQuestionError = zGetOpenCodeClientError;

assertTypesEqual<
  RespondToQuestionError,
  z.infer<typeof zRespondToQuestionError>
>({ value: true });
