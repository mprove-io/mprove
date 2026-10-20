import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/types/backend/errors/backend-org-does-not-exist-error';
import {
  type OrgEntToTabError,
  zOrgEntToTabError
} from '#common/types/backend/function-errors/org-ent-to-tab-error';

export type DbOrgsFindFirstCheckExistsError =
  | OrgEntToTabError
  | BackendOrgDoesNotExistError;

export let zDbOrgsFindFirstCheckExistsError = z.union([
  zOrgEntToTabError,
  zBackendOrgDoesNotExistError
]);

assertTypesEqual<
  DbOrgsFindFirstCheckExistsError,
  z.infer<typeof zDbOrgsFindFirstCheckExistsError>
>({
  value: true
});
