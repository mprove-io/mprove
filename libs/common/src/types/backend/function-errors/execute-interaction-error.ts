import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetOpenCodeClientError,
  zGetOpenCodeClientError
} from '#common/types/backend/function-errors/get-open-code-client-error';
import {
  type RejectQuestionError,
  zRejectQuestionError
} from '#common/types/backend/function-errors/reject-question-error';
import {
  type RespondToPermissionError,
  zRespondToPermissionError
} from '#common/types/backend/function-errors/respond-to-permission-error';
import {
  type RespondToQuestionError,
  zRespondToQuestionError
} from '#common/types/backend/function-errors/respond-to-question-error';

export type ExecuteInteractionError =
  | GetOpenCodeClientError
  | RespondToPermissionError
  | RespondToQuestionError
  | RejectQuestionError;

export let zExecuteInteractionError = z.union([
  zGetOpenCodeClientError,
  zRespondToPermissionError,
  zRespondToQuestionError,
  zRejectQuestionError
]);

assertTypesEqual<
  ExecuteInteractionError,
  z.infer<typeof zExecuteInteractionError>
>({ value: true });
