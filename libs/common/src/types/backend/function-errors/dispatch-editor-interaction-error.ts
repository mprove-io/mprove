import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMessageAgentRequiredError,
  zBackendMessageAgentRequiredError
} from '#common/types/backend/errors/backend-message-agent-required-error';
import {
  type BackendMessageVariantRequiredError,
  zBackendMessageVariantRequiredError
} from '#common/types/backend/errors/backend-message-variant-required-error';
import {
  type ExecuteInteractionError,
  zExecuteInteractionError
} from '#common/types/backend/function-errors/execute-interaction-error';
import {
  type PublishInteractCommandError,
  zPublishInteractCommandError
} from '#common/types/backend/function-errors/publish-interact-command-error';
import {
  type StartEventStreamError,
  zStartEventStreamError
} from '#common/types/backend/function-errors/start-event-stream-error';

export type DispatchEditorInteractionError =
  | StartEventStreamError
  | ExecuteInteractionError
  | PublishInteractCommandError
  | BackendMessageAgentRequiredError
  | BackendMessageVariantRequiredError;

export let zDispatchEditorInteractionError = z.union([
  zStartEventStreamError,
  zExecuteInteractionError,
  zPublishInteractCommandError,
  zBackendMessageAgentRequiredError,
  zBackendMessageVariantRequiredError
]);

assertTypesEqual<
  DispatchEditorInteractionError,
  z.infer<typeof zDispatchEditorInteractionError>
>({ value: true });
