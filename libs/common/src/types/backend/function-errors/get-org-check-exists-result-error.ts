import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendOrgDoesNotExistError,
  zBackendOrgDoesNotExistError
} from '#common/types/backend/errors/backend-org-does-not-exist-error';
import {
  type OrgEntToTabResultError,
  zOrgEntToTabResultError
} from '#common/types/backend/function-errors/org-ent-to-tab-result-error';

export type GetOrgCheckExistsResultError =
  | BackendOrgDoesNotExistError
  | OrgEntToTabResultError;

export let zGetOrgCheckExistsResultError = z.union([
  zBackendOrgDoesNotExistError,
  zOrgEntToTabResultError
]);

assertTypesEqual<
  GetOrgCheckExistsResultError,
  z.infer<typeof zGetOrgCheckExistsResultError>
>({ value: true });
