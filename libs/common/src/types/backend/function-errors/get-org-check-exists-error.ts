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

export type GetOrgCheckExistsError =
  | BackendOrgDoesNotExistError
  | OrgEntToTabError;

export let zGetOrgCheckExistsError = z.union([
  zBackendOrgDoesNotExistError,
  zOrgEntToTabError
]);

assertTypesEqual<
  GetOrgCheckExistsError,
  z.infer<typeof zGetOrgCheckExistsError>
>({ value: true });
