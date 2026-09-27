import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetProjectsListError = BackendError;

export let zToBackendGetProjectsListError = zBackendError;

assertTypesEqual<
  ToBackendGetProjectsListError,
  z.infer<typeof zToBackendGetProjectsListError>
>({ value: true });
