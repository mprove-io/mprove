import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteReportError = BackendError;

export let zToBackendDeleteReportError = zBackendError;

assertTypesEqual<
  ToBackendDeleteReportError,
  z.infer<typeof zToBackendDeleteReportError>
>({ value: true });
