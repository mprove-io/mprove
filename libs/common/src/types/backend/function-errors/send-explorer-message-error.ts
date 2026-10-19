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
  type GetModelSelectionError,
  zGetModelSelectionError
} from '#common/types/backend/function-errors/get-model-selection-error';
import {
  type OcMessageEntToTabError,
  zOcMessageEntToTabError
} from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
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
  | OcMessageEntToTabError
  | PrewarmCodexAuthError
  | WriteError
  | PublishInteractCommandError
  | BackendMessageProviderRequiredError
  | BackendMessageModelRequiredError
  | BackendExplorerContextLimitReachedError;

export let zSendExplorerMessageError = z.union([
  zGetModelSelectionError,
  zOcMessageEntToTabError,
  zPrewarmCodexAuthError,
  zWriteError,
  zPublishInteractCommandError,
  zBackendMessageProviderRequiredError,
  zBackendMessageModelRequiredError,
  zBackendExplorerContextLimitReachedError
]);

assertTypesEqual<
  SendExplorerMessageError,
  z.infer<typeof zSendExplorerMessageError>
>({ value: true });
