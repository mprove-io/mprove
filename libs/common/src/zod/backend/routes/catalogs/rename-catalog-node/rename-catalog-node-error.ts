import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendRenameCatalogNodeError = BackendError;

export let zToBackendRenameCatalogNodeError = zBackendError;

assertTypesEqual<
  ToBackendRenameCatalogNodeError,
  z.infer<typeof zToBackendRenameCatalogNodeError>
>({ value: true });
