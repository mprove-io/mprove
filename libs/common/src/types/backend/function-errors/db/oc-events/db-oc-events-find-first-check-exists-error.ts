import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOcEventDoesNotExistError,
  zBackendOcEventDoesNotExistError
} from '#common/types/backend/errors/backend-oc-event-does-not-exist-error';
import {
  type OcEventEntToTabError,
  zOcEventEntToTabError
} from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';

export type DbOcEventsFindFirstCheckExistsError =
  | OcEventEntToTabError
  | BackendOcEventDoesNotExistError;

export let zDbOcEventsFindFirstCheckExistsError = z.union([
  zOcEventEntToTabError,
  zBackendOcEventDoesNotExistError
]);

assertTypesEqual<
  DbOcEventsFindFirstCheckExistsError,
  z.infer<typeof zDbOcEventsFindFirstCheckExistsError>
>({
  value: true
});
