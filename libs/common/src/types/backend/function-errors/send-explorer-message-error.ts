import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendExplorerContextLimitReachedError,
  zBackendExplorerContextLimitReachedError
} from '#common/types/backend/errors/backend-explorer-context-limit-reached-error';
import {
  type BackendMessageModelRequiredError,
  zBackendMessageModelRequiredError
} from '#common/types/backend/errors/backend-message-model-required-error';
import {
  type BackendMessageProviderRequiredError,
  zBackendMessageProviderRequiredError
} from '#common/types/backend/errors/backend-message-provider-required-error';
import {
  type DbOcMessagesFindFirstError,
  zDbOcMessagesFindFirstError
} from '#common/types/backend/function-errors/db/oc-messages/db-oc-messages-find-first-error';
import {
  type GetModelSelectionError,
  zGetModelSelectionError
} from '#common/types/backend/function-errors/get-model-selection-error';
import {
  type PrewarmCodexAuthError,
  zPrewarmCodexAuthError
} from '#common/types/backend/function-errors/prewarm-codex-auth-error';
import {
  type PublishInteractCommandError,
  zPublishInteractCommandError
} from '#common/types/backend/function-errors/publish-interact-command-error';
import {
  type WriteError,
  zWriteError
} from '#common/types/backend/function-errors/write-error';

export type SendExplorerMessageError =
  | GetModelSelectionError
  | PrewarmCodexAuthError
  | WriteError
  | PublishInteractCommandError
  | BackendMessageProviderRequiredError
  | BackendMessageModelRequiredError
  | BackendExplorerContextLimitReachedError
  | DbOcMessagesFindFirstError;

export let zSendExplorerMessageError = z.union([
  zGetModelSelectionError,
  zPrewarmCodexAuthError,
  zWriteError,
  zPublishInteractCommandError,
  zBackendMessageProviderRequiredError,
  zBackendMessageModelRequiredError,
  zBackendExplorerContextLimitReachedError,
  zDbOcMessagesFindFirstError
]);

assertTypesEqual<
  SendExplorerMessageError,
  z.infer<typeof zSendExplorerMessageError>
>({ value: true });
