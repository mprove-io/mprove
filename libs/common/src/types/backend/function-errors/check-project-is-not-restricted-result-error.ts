import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/types/backend/errors/backend-restricted-project-error';

export type CheckProjectIsNotRestrictedResultError =
  BackendRestrictedProjectError;

export let zCheckProjectIsNotRestrictedResultError =
  zBackendRestrictedProjectError;

assertTypesEqual<
  CheckProjectIsNotRestrictedResultError,
  z.infer<typeof zCheckProjectIsNotRestrictedResultError>
>({ value: true });
