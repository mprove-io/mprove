import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendRestrictedProjectError,
  zBackendRestrictedProjectError
} from '#common/types/backend/errors/backend-restricted-project-error';

export type CheckProjectIsNotRestrictedError = BackendRestrictedProjectError;

export let zCheckProjectIsNotRestrictedError = zBackendRestrictedProjectError;

assertTypesEqual<
  CheckProjectIsNotRestrictedError,
  z.infer<typeof zCheckProjectIsNotRestrictedError>
>({ value: true });
