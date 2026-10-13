import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';

export type RejectQuestionError = GetOpenCodeClientError;

export let zRejectQuestionError = zGetOpenCodeClientError;

assertTypesEqual<RejectQuestionError, z.infer<typeof zRejectQuestionError>>({
  value: true
});
