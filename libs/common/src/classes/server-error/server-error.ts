import type { BackendCachedColumnDoesNotExistError } from '#common/types/backend/errors/backend-cached-column-does-not-exist-error';
import type { BackendCachedPartDoesNotExistError } from '#common/types/backend/errors/backend-cached-part-does-not-exist-error';
import type { BackendDconfigDoesNotExistError } from '#common/types/backend/errors/backend-dconfig-does-not-exist-error';
import type { BackendFavoriteDoesNotExistError } from '#common/types/backend/errors/backend-favorite-does-not-exist-error';
import type { BackendKitDoesNotExistError } from '#common/types/backend/errors/backend-kit-does-not-exist-error';
import type { BackendModelFieldLeafDoesNotExistError } from '#common/types/backend/errors/backend-model-field-leaf-does-not-exist-error';
import type { BackendOcEventDoesNotExistError } from '#common/types/backend/errors/backend-oc-event-does-not-exist-error';
import type { BackendOcMessageDoesNotExistError } from '#common/types/backend/errors/backend-oc-message-does-not-exist-error';
import type { BackendOcPartDoesNotExistError } from '#common/types/backend/errors/backend-oc-part-does-not-exist-error';
import type { BackendOcSessionDoesNotExistError } from '#common/types/backend/errors/backend-oc-session-does-not-exist-error';
import type { BackendUconfigDoesNotExistError } from '#common/types/backend/errors/backend-uconfig-does-not-exist-error';
import type { ToBackendResponse } from '#common/types/backend/response/to-backend-response';
import type { ToBlockmlResponse } from '#common/types/blockml/response/to-blockml-response';
import type { ToDiskResponse } from '#common/types/disk/response/to-disk-response';
import type { Er } from '#common/types/shared/errors/er';

type ServerErrorMessage =
  | Er
  // Internal DB-reader failures that are not exposed by API responses.
  | BackendCachedColumnDoesNotExistError['code']
  | BackendCachedPartDoesNotExistError['code']
  | BackendDconfigDoesNotExistError['code']
  | BackendKitDoesNotExistError['code']
  | BackendFavoriteDoesNotExistError['code']
  | BackendModelFieldLeafDoesNotExistError['code']
  | BackendOcEventDoesNotExistError['code']
  | BackendOcMessageDoesNotExistError['code']
  | BackendOcPartDoesNotExistError['code']
  | BackendOcSessionDoesNotExistError['code']
  | BackendUconfigDoesNotExistError['code']
  | Extract<ToBackendResponse, { type: 'Failure' }>['error']['code']
  | Extract<ToBlockmlResponse, { type: 'Failure' }>['error']['code']
  | Extract<ToDiskResponse, { type: 'Failure' }>['error']['code'];

export class ServerError extends Error {
  message: ServerErrorMessage;

  displayData?: any;

  customData?: any;

  originalError?: any;

  constructor(item: {
    message: ServerErrorMessage;
    displayData?: any;
    customData?: any;
    originalError?: any;
  }) {
    super();

    this.message = item.message;
    this.displayData = item.displayData;
    this.customData = item.customData;
    this.originalError = item.originalError;
  }
}
