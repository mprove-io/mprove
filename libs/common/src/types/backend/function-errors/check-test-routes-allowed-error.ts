import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendTestRoutesForbiddenError,
  zBackendTestRoutesForbiddenError
} from '#common/types/backend/errors/backend-test-routes-forbidden-error';

export type CheckTestRoutesAllowedError = BackendTestRoutesForbiddenError;

export const zCheckTestRoutesAllowedError = zBackendTestRoutesForbiddenError;

assertTypesEqual<
  CheckTestRoutesAllowedError,
  z.infer<typeof zCheckTestRoutesAllowedError>
>({ value: true });
