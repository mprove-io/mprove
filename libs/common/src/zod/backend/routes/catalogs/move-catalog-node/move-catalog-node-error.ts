import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendMoveCatalogNodeError = BackendError;

export let zToBackendMoveCatalogNodeError = zBackendError;

assertTypesEqual<
  ToBackendMoveCatalogNodeError,
  z.infer<typeof zToBackendMoveCatalogNodeError>
>({ value: true });
