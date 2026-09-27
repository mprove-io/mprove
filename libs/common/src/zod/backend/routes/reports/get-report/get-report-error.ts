import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetReportError = BackendError;

export let zToBackendGetReportError = zBackendError;

assertTypesEqual<
  ToBackendGetReportError,
  z.infer<typeof zToBackendGetReportError>
>({ value: true });
